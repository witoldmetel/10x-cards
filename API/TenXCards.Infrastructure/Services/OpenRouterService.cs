using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Services;
using System.Text.Json.Serialization;
using System.Net.Http.Headers;
using TenXCards.Infrastructure.Utils;
using TenXCards.Infrastructure.Data;

namespace TenXCards.Infrastructure.Services
{
    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly OpenRouterOptions _options;
        private readonly ILogger<OpenRouterService> _logger;
        private const string API_ENDPOINT = "https://openrouter.ai/api/v1";
        private const int MAX_SOURCE_TEXT_LENGTH = 10000;
        private const int MAX_CARDS_PER_REQUEST = 50;

        public string DefaultModelName => _options.DefaultModel;

        public OpenRouterService(HttpClient httpClient, IOptions<OpenRouterOptions> options, ILogger<OpenRouterService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;

            _logger.LogInformation("Initializing AIService with options: DefaultModel={DefaultModel}, SiteName={SiteName}, SiteUrl={SiteUrl}, TimeoutSeconds={TimeoutSeconds}",
                _options.DefaultModel,
                _options.SiteName,
                _options.SiteUrl,
                _options.TimeoutSeconds);

            try 
            {
                _httpClient.BaseAddress = new Uri(API_ENDPOINT);
                _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
                
                // Configure default headers
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
                _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                _httpClient.DefaultRequestHeaders.Add("X-Title", _options.SiteName ?? "10X Cards");
                _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", _options.SiteUrl ?? "http://localhost:3000");

                _logger.LogInformation("Successfully configured HttpClient for OpenRouter API at {BaseAddress}", _httpClient.BaseAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring HttpClient");
                throw;
            }
        }

        public async Task<AIGenerationResult> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(sourceText))
                throw new ArgumentException("Source text cannot be empty", nameof(sourceText));

            // Sanitize the input text
            sourceText = TextSanitizer.SanitizeForJson(sourceText);
            sourceText = TextSanitizer.SanitizeForAI(sourceText);

            if (sourceText.Length > MAX_SOURCE_TEXT_LENGTH)
                throw new ArgumentException($"Source text exceeds maximum length of {MAX_SOURCE_TEXT_LENGTH} characters", nameof(sourceText));

            if (numberOfCards <= 0 || numberOfCards > MAX_CARDS_PER_REQUEST)
                throw new ArgumentException($"Number of cards must be between 1 and {MAX_CARDS_PER_REQUEST}", nameof(numberOfCards));

            _logger.LogInformation("Generating {NumberOfCards} flashcards using model {ModelName}", 
                numberOfCards, 
                modelName ?? _options.DefaultModel);

            var systemPrompt = "You are a highly skilled AI specialized in creating educational flashcards. " +
                             "Your task is to generate concise, clear, and effective flashcards from the provided text. " +
                             "Each flashcard should capture a key concept, fact, or relationship. " +
                             "Focus on accuracy and educational value. " +
                             "Ensure questions are clear and answers are concise but complete.";

            var userPrompt = $@"Analyze the following text and provide:
1. A list of {numberOfCards} flashcards
2. 2-4 relevant topic tags for the entire content
3. 1-2 broad subject categories for the entire content

Respond with ONLY a valid JSON object using this exact structure:
{{
    ""flashcards"": [
        {{
            ""front"": ""question text"",
            ""back"": ""answer text""
        }}
    ],
    ""tags"": [""tag1"", ""tag2""],
    ""categories"": [""category1""]
}}

Source text:
{sourceText}";

            var request = new OpenRouterRequest
            {
                Model = modelName ?? _options.DefaultModel,
                Messages = new List<Message>
                {
                    new() { Role = "system", Content = systemPrompt },
                    new() { Role = "user", Content = userPrompt }
                },
                Temperature = 0.7f,
                MaxTokens = 2000,
                ResponseFormat = new ResponseFormat { Type = "json_object" }
            };

            if (apiModelKey != null)
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiModelKey);
            }

            try
            {
                _logger.LogInformation("Sending request to OpenRouter API at {Endpoint}/chat/completions", API_ENDPOINT);

                // Create request message with proper content type header
                var content = JsonContent.Create(request);
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

                using var response = await _httpClient.PostAsync("chat/completions", content, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError("OpenRouter API request failed with status {StatusCode}. Response: {ErrorContent}", 
                        response.StatusCode, 
                        errorContent);
                    throw new Exception($"OpenRouter API request failed with status {response.StatusCode}: {errorContent}");
                }

                var result = await response.Content.ReadFromJsonAsync<OpenRouterResponse>(cancellationToken: cancellationToken);
                if (result?.Choices == null || result.Choices.Count == 0)
                {
                    throw new Exception("No response from AI service");
                }

                var jsonResponse = result.Choices[0].Message.Content;
                _logger.LogInformation("Received response from OpenRouter: {Response}", jsonResponse);

                var generatedContent = JsonSerializer.Deserialize<AIGeneratedContent>(jsonResponse, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }) ?? throw new Exception("Failed to parse AI response");

                if (generatedContent.Flashcards.Count != numberOfCards)
                {
                    _logger.LogWarning("Received {ActualCount} flashcards instead of requested {RequestedCount}", 
                        generatedContent.Flashcards.Count, numberOfCards);
                }

                var flashcards = new List<CreateFlashcardDto>();
                foreach (var card in generatedContent.Flashcards)
                {
                    if (string.IsNullOrWhiteSpace(card.Front) || string.IsNullOrWhiteSpace(card.Back))
                    {
                        throw new Exception("Invalid flashcard format: front and back must not be empty");
                    }

                    flashcards.Add(new CreateFlashcardDto
                    {
                        Front = card.Front,
                        Back = card.Back,
                        CreationSource = FlashcardCreationSource.AI,
                        ReviewStatus = ReviewStatus.New
                    });
                }

                _logger.LogInformation("Successfully generated {Count} flashcards with {TagCount} tags and {CategoryCount} categories", 
                    flashcards.Count,
                    generatedContent.Tags.Count,
                    generatedContent.Categories.Count);

                return new AIGenerationResult
                {
                    Flashcards = flashcards,
                    Tags = generatedContent.Tags,
                    Categories = generatedContent.Categories
                };
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request to OpenRouter API failed");
                throw new Exception($"Failed to connect to OpenRouter API: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards");
                throw;
            }
            finally
            {
                if (apiModelKey != null)
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
                }
            }
        }

        private class AIGeneratedContent
        {
            [JsonPropertyName("flashcards")]
            public List<AIGeneratedCard> Flashcards { get; set; } = new();

            [JsonPropertyName("tags")]
            public List<string> Tags { get; set; } = new();

            [JsonPropertyName("categories")]
            public List<string> Categories { get; set; } = new();
        }

        private class AIGeneratedCard
        {
            [JsonPropertyName("front")]
            public string Front { get; set; } = string.Empty;

            [JsonPropertyName("back")]
            public string Back { get; set; } = string.Empty;
        }

        private class OpenRouterRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = string.Empty;

            [JsonPropertyName("messages")]
            public List<Message> Messages { get; set; } = new();

            [JsonPropertyName("temperature")]
            public float Temperature { get; set; }

            [JsonPropertyName("max_tokens")]
            public int MaxTokens { get; set; }

            [JsonPropertyName("response_format")]
            public ResponseFormat ResponseFormat { get; set; } = new();
        }

        private class Message
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = string.Empty;

            [JsonPropertyName("content")]
            public string Content { get; set; } = string.Empty;
        }

        private class ResponseFormat
        {
            [JsonPropertyName("type")]
            public string Type { get; set; } = string.Empty;
        }

        private class OpenRouterResponse
        {
            [JsonPropertyName("choices")]
            public List<Choice> Choices { get; set; } = new();

            public class Choice
            {
                [JsonPropertyName("message")]
                public Message Message { get; set; } = new();
            }
        }
    }
} 
