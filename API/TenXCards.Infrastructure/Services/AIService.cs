using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using TenXCards.Core.Configuration;
using TenXCards.Core.DTOs;
using TenXCards.Core.DTOs.OpenAI;
using TenXCards.Core.Models;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly OpenRouterOptions _options;
        private readonly ILogger<AIService> _logger;
        private const string API_ENDPOINT = "https://openrouter.ai/api/v1";

        public string DefaultModelName => _options.DefaultModel;

        public AIService(HttpClient httpClient, IOptions<OpenRouterOptions> options, ILogger<AIService> logger)
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
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.ApiKey}");
                _httpClient.DefaultRequestHeaders.Add("X-Title", _options.SiteName ?? "10X Cards");
                _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", _options.SiteUrl ?? "http://localhost:3000");
                _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");

                _logger.LogInformation("Successfully configured HttpClient for OpenRouter API at {BaseAddress}", _httpClient.BaseAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring HttpClient");
                throw;
            }
        }

        public async Task<List<CreateFlashcardDto>> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating {NumberOfCards} flashcards using model {ModelName}", 
                numberOfCards, 
                modelName ?? _options.DefaultModel);

            var prompt = $@"Generate {numberOfCards} flashcards from the following text. Each flashcard should have a question on the front and a concise answer on the back. Also include relevant tags and categories.

You must respond with ONLY a valid JSON array of objects with this exact structure:
[{{
    ""front"": ""question text here"",
    ""back"": ""answer text here"",
    ""tags"": [""tag1"", ""tag2""],
    ""category"": [""category1"", ""category2""]
}}]

Do not include any explanations or text outside of the JSON array.

Source text:
{sourceText}";

            var request = new OpenAIRequestDto
            {
                Model = modelName ?? _options.DefaultModel,
                Messages = new List<OpenAIRequestDto.Message>
                {
                    new() { Role = "system", Content = "You are a helpful AI that generates high-quality flashcards from provided text. Focus on key concepts and ensure questions are clear and answers are concise. Always format output as valid JSON." },
                    new() { Role = "user", Content = prompt }
                },
                Temperature = 0.7f,
                MaxTokens = 1000,
                ResponseFormat = "json_object"
            };

            if (apiModelKey != null)
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiModelKey}");
            }

            try
            {
                _logger.LogInformation("Sending request to OpenRouter API at {Endpoint}/chat/completions", API_ENDPOINT);
                
                using var response = await _httpClient.PostAsJsonAsync("chat/completions", request, cancellationToken);
                
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

                var flashcards = JsonSerializer.Deserialize<List<CreateFlashcardDto>>(jsonResponse) ?? 
                    throw new Exception("Failed to parse flashcards from API response");

                foreach (var flashcard in flashcards)
                {
                    flashcard.CreationSource = FlashcardCreationSource.AI;
                    flashcard.ReviewStatus = ReviewStatus.New;
                }

                _logger.LogInformation("Successfully generated {Count} flashcards", flashcards.Count);
                return flashcards;
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
                    _httpClient.DefaultRequestHeaders.Remove("Authorization");
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.ApiKey}");
                }
            }
        }

        private class OpenRouterResponse
        {
            public List<Choice> Choices { get; set; } = new();

            public class Choice
            {
                public Message Message { get; set; } = new();
            }

            public class Message
            {
                public string Content { get; set; } = string.Empty;
            }
        }
    }
} 
