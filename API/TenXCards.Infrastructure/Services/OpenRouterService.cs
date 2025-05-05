using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TenXCards.Core.Exceptions;
using TenXCards.Core.Models;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services
{
    /// <summary>
    /// Service for communicating with the OpenRouter API
    /// </summary>
    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OpenRouterService> _logger;
        private readonly Dictionary<string, object> _defaultParameters;

        public string ApiEndpoint { get; }
        public string DefaultModelName { get; }
        public IReadOnlyDictionary<string, object> DefaultParameters => _defaultParameters;

        /// <summary>
        /// Initializes a new instance of the OpenRouterService
        /// </summary>
        public OpenRouterService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenRouterService> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            _logger.LogInformation("Initializing OpenRouterService...");

            var baseUrl = configuration["OpenRouter:BaseUrl"] 
                ?? throw new ArgumentException("OpenRouter base URL not found in configuration");

            var apiPath = configuration["OpenRouter:ApiEndpoint"] ?? "/api/v1/chat/completions";
            ApiEndpoint = baseUrl.TrimEnd('/') + (apiPath.StartsWith("/") ? apiPath : "/" + apiPath);
            
            var apiKey = configuration["OpenRouter:ApiKey"] 
                ?? throw new ArgumentException("OpenRouter API key not found in configuration");
            
            // Remove "Bearer " prefix if present
            apiKey = apiKey.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                ? apiKey.Substring("Bearer ".Length).Trim()
                : apiKey.Trim();
            
            if (string.IsNullOrEmpty(apiKey) || apiKey.Length < 20)
            {
                throw new OpenRouterAuthenticationException("API key seems invalid (too short or empty)");
            }
            
            DefaultModelName = configuration["OpenRouter:DefaultModel"] ?? "gpt-4";
            
            _defaultParameters = new Dictionary<string, object>
            {
                { "temperature", 0.7 },
                { "top_p", 0.95 },
                { "max_tokens", 750 }
            };

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
            var siteUrl = configuration["OpenRouter:SiteUrl"] ?? "https://github.com/10xCards/FlashCard";
            var siteName = configuration["OpenRouter:SiteName"] ?? "FlashCard";
            
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", siteUrl);
            _httpClient.DefaultRequestHeaders.Add("X-Title", siteName);
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("FlashCard/1.0");
            
            _logger.LogInformation("OpenRouterService initialized successfully");
        }

        private OpenRouterRequest BuildRequest(
            string userMessage,
            string? systemMessage,
            string? modelName,
            Dictionary<string, object>? parameters)
        {
            if (string.IsNullOrWhiteSpace(userMessage))
            {
                throw new OpenRouterValidationException("User message cannot be empty");
            }

            var messages = new List<Message>();
            
            if (!string.IsNullOrWhiteSpace(systemMessage))
            {
                messages.Add(new Message { Role = "system", Content = systemMessage });
            }

            messages.Add(new Message { Role = "user", Content = userMessage });

            var mergedParameters = new Dictionary<string, object>(_defaultParameters);
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    mergedParameters[param.Key] = param.Value;
                }
            }

            return new OpenRouterRequest
            {
                Messages = messages,
                Model = modelName ?? DefaultModelName,
                Temperature = Convert.ToDouble(mergedParameters["temperature"]),
                TopP = Convert.ToDouble(mergedParameters["top_p"]),
                MaxTokens = Convert.ToInt32(mergedParameters["max_tokens"])
            };
        }

        public async Task<string> GetChatResponseAsync(
            string userMessage,
            string? systemMessage = null,
            string? modelName = null,
            Dictionary<string, object>? parameters = null,
            ResponseFormat? responseFormat = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Hash the source text to help with caching and tracking
                var sourceHash = ComputeHash(userMessage);
                _logger.LogInformation("Processing request with hash: {Hash}", sourceHash);

                var request = BuildRequest(userMessage, systemMessage, modelName, parameters);
                
                if (responseFormat != null)
                {
                    request = request with { ResponseFormat = responseFormat };
                }
                
                var jsonOptions = new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                
                var requestJson = JsonSerializer.Serialize(request, jsonOptions);
                _logger.LogDebug("Sending request to OpenRouter. Payload: {Payload}", requestJson);
                
                using var content = JsonContent.Create(request, null, jsonOptions);
                using var response = await _httpClient.PostAsync(ApiEndpoint, content, cancellationToken);
                
                var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenRouter API error: {StatusCode} - {Error}", response.StatusCode, rawContent);
                    
                    if (response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        throw new OpenRouterAuthenticationException("Invalid API key or authentication failed");
                    }
                    
                    throw new OpenRouterCommunicationException(
                        $"API request failed with status code {response.StatusCode}: {rawContent}",
                        (int)response.StatusCode);
                }

                try 
                {
                    var result = JsonSerializer.Deserialize<OpenRouterResponse>(rawContent, jsonOptions);

                    if (result == null)
                    {
                        throw new OpenRouterValidationException("Received null response from API");
                    }
                    
                    if (result.Choices == null || result.Choices.Count == 0 || 
                        result.Choices[0].Message?.Content == null || string.IsNullOrWhiteSpace(result.Choices[0].Message?.Content))
                    {
                        throw new OpenRouterValidationException("Response contains no valid content");
                    }
                    
                    var messageContent = result.Choices[0].Message?.Content ?? throw new OpenRouterValidationException("Message content is null");
                    messageContent = SanitizeJsonResponse(messageContent);
                    
                    if (result.Usage != null)
                    {
                        _logger.LogInformation(
                            "API usage for request {Hash} - Prompt tokens: {PromptTokens}, Completion tokens: {CompletionTokens}, Total: {TotalTokens}",
                            sourceHash,
                            result.Usage.PromptTokens,
                            result.Usage.CompletionTokens,
                            result.Usage.TotalTokens);
                    }

                    return messageContent;
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse response JSON. Raw content: {Content}", rawContent);
                    throw new OpenRouterValidationException($"Failed to parse API response: {ex.Message}", ex);
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP error during API request");
                throw new OpenRouterCommunicationException($"HTTP error: {ex.Message}", 0);
            }
            catch (OpenRouterException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during API request");
                throw new OpenRouterException("Unexpected error during API request", ex);
            }
        }

        private static string ComputeHash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);

            return Convert.ToBase64String(hash);
        }

        private static string SanitizeJsonResponse(string content)
        {
            content = content.Trim();
            
            // Remove markdown headers
            if (content.StartsWith("```json") || content.StartsWith("```"))
            {
                var startIndex = content.IndexOf('[');
                var endIndex = content.LastIndexOf(']');
                
                if (startIndex >= 0 && endIndex > startIndex)
                {
                    content = content.Substring(startIndex, endIndex - startIndex + 1);
                }
            }
            
            // Check if we already have a JSON array
            if (!content.StartsWith("[") || !content.EndsWith("]"))
            {
                // Find the start of the array
                var startIndex = content.IndexOf('[');
                
                if (startIndex >= 0)
                {
                    // Cut text from array start
                    content = content.Substring(startIndex);
                    
                    // Check if array is properly terminated
                    var endIndex = content.LastIndexOf(']');
                    
                    if (endIndex > 0)
                    {
                        // We have start and end of array
                        content = content.Substring(0, endIndex + 1);
                    }
                    else
                    {
                        // No closing bracket - we need to add it
                        // But first check if it ends with comma
                        content = content.TrimEnd();
                        if (content.EndsWith(","))
                        {
                            content = content.Substring(0, content.Length - 1);
                        }
                        // Add closing bracket
                        content += "]";
                    }
                }
            }
            
            return content;
        }
    }
} 