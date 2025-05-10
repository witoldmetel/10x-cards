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
        private readonly IOptions<OpenRouterOptions> _options;

        public string ApiEndpoint { get; }
        public string DefaultModelName { get; }
        public IReadOnlyDictionary<string, object> DefaultParameters => _defaultParameters;

        /// <summary>
        /// Initializes a new instance of the OpenRouterService
        /// </summary>
        public OpenRouterService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenRouterService> logger, IOptions<OpenRouterOptions> options)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options ?? throw new ArgumentNullException(nameof(options));

            var baseUrl = configuration["OpenRouter:BaseUrl"] 
                ?? throw new ArgumentException("OpenRouter base URL not found in configuration");

            var apiPath = configuration["OpenRouter:ApiEndpoint"] ?? "/chat/completions";
            ApiEndpoint = baseUrl.TrimEnd('/') + apiPath;

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
            
            var siteUrl = configuration["OpenRouter:SiteUrl"] ?? "https://github.com/10xCards/FlashCard";
            var siteName = configuration["OpenRouter:SiteName"] ?? "FlashCard";
            
            // Add required OpenRouter headers
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", siteUrl);
            _httpClient.DefaultRequestHeaders.Add("X-Title", siteName);
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("10XCards/1.0");
        }

        private OpenRouterRequest BuildRequest(
            string userMessage,
            string? systemMessage,
            string? modelName,
            Dictionary<string, object>? parameters)
        {
            var messages = new List<Message>();
            
            if (!string.IsNullOrEmpty(systemMessage))
            {
                messages.Add(new Message { Role = "system", Content = systemMessage });
            }
            
            messages.Add(new Message { Role = "user", Content = userMessage });

            var request = new OpenRouterRequest
            {
                Model = modelName ?? _options.Value.DefaultModel,
                Messages = messages
            };

            if (parameters != null)
            {
                if (parameters.TryGetValue("temperature", out var temp) && temp is double temperature)
                {
                    request = request with { Temperature = temperature };
                }
                
                if (parameters.TryGetValue("max_tokens", out var tokens) && tokens is int maxTokens)
                {
                    request = request with { MaxTokens = maxTokens };
                }
            }

            return request;
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
                    _logger.LogInformation("Raw response from OpenRouter: {RawContent}", rawContent);
                    var result = JsonSerializer.Deserialize<OpenRouterResponse>(rawContent, jsonOptions);
                    _logger.LogInformation("Deserialized OpenRouter response: {Response}", JsonSerializer.Serialize(result, jsonOptions));

                    if (result?.Choices == null || result.Choices.Count == 0 || 
                        result.Choices[0].Message?.Content == null)
                    {
                        _logger.LogError("Invalid response structure: Choices={Choices}, Count={Count}, Message={Message}, Content={Content}", 
                            result?.Choices != null, 
                            result?.Choices?.Count ?? 0,
                            result?.Choices?[0].Message != null,
                            result?.Choices?[0].Message?.Content);
                        throw new OpenRouterValidationException("Response contains no valid content");
                    }

                    var messageContent = result.Choices[0].Message.Content;
                    var sanitized = SanitizeJsonResponse(messageContent);

                    return sanitized;
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

        private static string SanitizeJsonResponse(string content)
        {
            content = content.Trim();
            
            // Remove markdown code block markers if present
            if (content.StartsWith("```json"))
            {
                content = content.Substring("```json".Length);
            }
            else if (content.StartsWith("```"))
            {
                content = content.Substring("```".Length);
            }
            if (content.EndsWith("```"))
            {
                content = content.Substring(0, content.Length - "```".Length);
            }
            
            content = content.Trim();
            
            return content;
        }
    }

    public record OpenRouterRequest
    {
        [JsonPropertyName("model")]
        public required string Model { get; init; }

        [JsonPropertyName("messages")]
        public required List<Message> Messages { get; init; }

        [JsonPropertyName("temperature")]
        public double Temperature { get; init; } = 0.7;

        [JsonPropertyName("top_p")]
        public double TopP { get; init; } = 0.95;

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; init; } = 750;

        [JsonPropertyName("response_format")]
        public ResponseFormat? ResponseFormat { get; init; }
    }

    file class OpenRouterResponse
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("created")]
        public long Created { get; set; }

        [JsonPropertyName("choices")]
        public List<OpenRouterChoice>? Choices { get; set; }
    }

    file class OpenRouterChoice
    {
        [JsonPropertyName("message")]
        public OpenRouterMessage? Message { get; set; }

        [JsonPropertyName("finish_reason")]
        public string? FinishReason { get; set; }
    }

    file class OpenRouterMessage
    {
        [JsonPropertyName("role")]
        public string? Role { get; set; }

        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}