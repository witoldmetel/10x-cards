using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;
using System.Net.Http.Headers;
using TenXCards.Core.Exceptions;
using TenXCards.Core.DTOs;
using Microsoft.Extensions.Options;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services;

// Using ResponseFormat from TenXCards.Core.Services

public class Message
{
    [JsonPropertyName("role")]
    public required string Role { get; set; }
    
    [JsonPropertyName("content")]
    public required string Content { get; set; }
}

public record OpenRouterRequest
{
    [JsonPropertyName("messages")]
    public required List<Message> Messages { get; set; }
    
    [JsonPropertyName("model")]
    public required string Model { get; set; }
    
    [JsonPropertyName("temperature")]
    public double Temperature { get; set; }
    
    [JsonPropertyName("top_p")]
    public double TopP { get; set; }
    
    [JsonPropertyName("max_tokens")]
    public int MaxTokens { get; set; }
    
    [JsonPropertyName("response_format")]
    public ResponseFormat? ResponseFormat { get; set; }
}

public class OpenRouterService : IOpenRouterService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenRouterService> _logger;
    private readonly Dictionary<string, object> _defaultParameters;

    public string ApiEndpoint { get; }
    public string DefaultModelName { get; }
    public IReadOnlyDictionary<string, object> DefaultParameters => _defaultParameters;

    public OpenRouterService(HttpClient httpClient, IOptions<OpenRouterOptions> options, ILogger<OpenRouterService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        var configuration = options.Value;
        _logger.LogInformation("Initializing OpenRouterService...");
        
        var baseUrl = configuration.BaseUrl 
            ?? throw new ArgumentException("OpenAI base URL not found in configuration");
        
        // Creating full API URL
        var apiPath = configuration.ApiEndpoint ?? "/api/v1/chat/completions";
        ApiEndpoint = baseUrl.TrimEnd('/') + (apiPath.StartsWith("/") ? apiPath : "/" + apiPath);
        
        var apiKey = configuration.ApiKey 
            ?? throw new ArgumentException("OpenAI API key not found in configuration");
        
        // Remove "Bearer " prefix if exists
        apiKey = apiKey.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? apiKey.Substring("Bearer ".Length).Trim()
            : apiKey.Trim();
        
        if (string.IsNullOrEmpty(apiKey) || (apiKey.Length < 20 && apiKey != "test-api-key"))
        {
            throw new OpenRouterAuthenticationException("API key seems invalid (too short or empty)");
        }
        
        DefaultModelName = configuration.DefaultModel ?? "gpt-4";
        
        _defaultParameters = new Dictionary<string, object>
        {
            { "temperature", 0.7 },
            { "top_p", 0.95 },
            { "max_tokens", 750 }
        };

        // HttpClient configuration
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        
        var siteUrl = configuration.SiteUrl ?? "https://github.com/10xCards/FlashCard";
        var siteName = configuration.SiteName ?? "FlashCard";
        
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
            _logger.LogDebug("Sending request to OpenAI. Payload: {Payload}", requestJson);
            
            using var content = JsonContent.Create(request, null, jsonOptions);
            using var response = await _httpClient.PostAsync(ApiEndpoint, content, cancellationToken);
            
            var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("OpenAI API error: {StatusCode} - {Error}", response.StatusCode, rawContent);
                
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
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
                
                if (result.Choices == null || result.Choices.Count == 0)
                {
                    throw new OpenRouterValidationException("Response contains no choices");
                }
                
                var firstChoice = result.Choices[0];
                if (firstChoice.Message == null)
                {
                    throw new OpenRouterValidationException("Response contains null message");
                }
                
                if (string.IsNullOrWhiteSpace(firstChoice.Message.Content))
                {
                    throw new OpenRouterValidationException("Response contains empty content");
                }
                
                // Format content to valid flashcards JSON
                string messageContent = firstChoice.Message.Content;
                messageContent = FormatResponseToValidFlashcardsJson(messageContent);
                
                if (result.Usage != null)
                {
                    _logger.LogInformation(
                        "API usage - Prompt tokens: {PromptTokens}, Completion tokens: {CompletionTokens}, Total: {TotalTokens}",
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

    public async Task<GeneratedFlashcardsContent> GenerateFlashcardsAsync(
        string sourceText,
        int numberOfCards,
        string? systemMessage = null,
        string? modelName = null, 
        CancellationToken cancellationToken = default)
    {
        // System message to instruct the AI how to generate flashcards
        string defaultSystemMessage = @"
You are a flashcard generator. You create educational flashcards based on provided text.
Output ONLY valid JSON array of flashcard objects with these fields:
1. front - the question side
2. back - the answer side
3. reviewStatus - always set to ""New""

All cards must be related to the source text. Don't include irrelevant examples.
Format cards in this structure exactly:
[
  {
    ""front"": ""Question 1?"",
    ""back"": ""Answer 1"",
    ""reviewStatus"": ""New"",
    ""creationSource"": ""AI""
  },
  ...more cards...
]";

        // Use provided system message or default
        var effectiveSystemMessage = systemMessage ?? defaultSystemMessage;
        
        // Format user message with source text and card count
        var userMessage = $"Generate {numberOfCards} flashcards based on this text:\n\n{sourceText}";
        
        try 
        {
            // Use response format for JSON
            var responseFormat = new ResponseFormat { Type = "json_object" };
            
            // Get JSON response from AI
            var jsonResponse = await GetChatResponseAsync(
                userMessage, 
                effectiveSystemMessage,
                modelName,
                null,
                responseFormat,
                cancellationToken);
            
            // Parse response
            try 
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                // Parse flashcards from JSON array
                var flashcardDtos = JsonSerializer.Deserialize<List<CreateFlashcardDto>>(jsonResponse, options) 
                    ?? new List<CreateFlashcardDto>();
                
                // Extract categories and tags (if any)
                var tags = new List<string>();
                var categories = new List<string>();
                
                // For now, extract basic tags from source text
                var potentialTags = sourceText
                    .Split(new[] { ' ', ',', '.', '!', '?', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries)
                    .Where(word => word.Length > 4)
                    .Take(5)
                    .ToList();
                
                tags.AddRange(potentialTags);
                
                return new GeneratedFlashcardsContent
                {
                    Flashcards = flashcardDtos,
                    Tags = tags.Distinct().ToList(),
                    Categories = categories
                };
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse flashcard JSON: {Content}", jsonResponse);
                throw new OpenRouterValidationException("Failed to parse flashcards from AI response", ex);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating flashcards");
            throw;
        }
    }

    private string FormatResponseToValidFlashcardsJson(string content)
    {
        content = content.Trim();
        
        // Remove any markdown headers
        if (content.StartsWith("```json") || content.StartsWith("```"))
        {
            var startIndex = content.IndexOf('[');
            var endIndex = content.LastIndexOf(']');
            
            if (startIndex >= 0 && endIndex > startIndex)
            {
                content = content.Substring(startIndex, endIndex - startIndex + 1);
            }
        }
        
        // Check if content is already a valid JSON array
        if (!content.StartsWith("[") || !content.EndsWith("]"))
        {
            // If not, try to find array in text
            var startIndex = content.IndexOf('[');
            
            if (startIndex >= 0)
            {
                // Cut text from array start
                content = content.Substring(startIndex);
                
                // Check if array is properly closed
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
                    _logger.LogWarning("Found incomplete JSON array, adding closing bracket");
                }
            }
        }
        
        // Check if JSON contains incomplete objects
        try 
        {
            // Try parsing
            using var doc = JsonDocument.Parse(content);
            
            // Check if root element is array
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                _logger.LogWarning("API response is not a JSON array, trying to wrap it");
                content = $"[{content}]";
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to validate JSON response, attempting to fix");
            
            // Try to fix common JSON problems
            // 1. Unclosed last object
            if (content.Contains("{") && !content.EndsWith("}]"))
            {
                // Count braces
                int openBraces = content.Count(c => c == '{');
                int closeBraces = content.Count(c => c == '}');
                
                if (openBraces > closeBraces)
                {
                    // Missing closing curly braces
                    for (int i = 0; i < openBraces - closeBraces; i++)
                    {
                        content += "}";
                    }
                    
                    // Add closing array bracket if missing
                    if (!content.TrimEnd().EndsWith("]"))
                    {
                        content += "]";
                    }
                    
                    _logger.LogWarning("Fixed incomplete JSON by adding closing braces");
                }
            }
        }
        
        return content;
    }
}

// Helper classes for deserializing OpenRouter response
file class OpenRouterResponse
{
    [JsonPropertyName("choices")]
    public List<OpenRouterChoice>? Choices { get; set; }
    
    [JsonPropertyName("usage")]
    public OpenRouterUsage? Usage { get; set; }
}

file class OpenRouterChoice
{
    [JsonPropertyName("message")]
    public OpenRouterMessage? Message { get; set; }
}

file class OpenRouterMessage
{
    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

file class OpenRouterUsage
{
    [JsonPropertyName("prompt_tokens")]
    public int PromptTokens { get; set; }
    
    [JsonPropertyName("completion_tokens")]
    public int CompletionTokens { get; set; }
    
    [JsonPropertyName("total_tokens")]
    public int TotalTokens { get; set; }
}