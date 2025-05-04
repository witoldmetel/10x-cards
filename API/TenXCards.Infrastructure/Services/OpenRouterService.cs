using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TenXCards.Core.DTOs;
using TenXCards.Core.Exceptions;
using TenXCards.Core.Models;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services
{
    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OpenRouterService> _logger;
        private readonly OpenRouterOptions _options;
        private readonly JsonSerializerOptions _jsonOptions;

        public string DefaultModelName => _options.DefaultModel;

        public OpenRouterService(
            HttpClient httpClient,
            IOptions<OpenRouterOptions> options,
            ILogger<OpenRouterService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _options = options.Value;

            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", _options.Referer);
            _httpClient.DefaultRequestHeaders.Add("X-Title", _options.Title);

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        public async Task<AIGenerationResult> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Generating {NumberOfCards} flashcards using model {ModelName}", 
                numberOfCards, modelName ?? DefaultModelName);

            ValidateInput(sourceText, numberOfCards);
            string sanitizedText = SanitizeText(sourceText);
            
            if (string.IsNullOrWhiteSpace(sanitizedText))
            {
                throw new BadRequestException("Source text cannot be empty after sanitization");
            }

            var prompt = CreatePrompt(sanitizedText, numberOfCards);
            var response = await MakeRequestToOpenRouter(prompt, modelName, apiModelKey, cancellationToken);
            
            return ParseResponseToFlashcards(response);
        }

        private void ValidateInput(string sourceText, int numberOfCards)
        {
            if (string.IsNullOrWhiteSpace(sourceText))
            {
                throw new BadRequestException("Source text cannot be empty");
            }
            
            if (numberOfCards < 3 || numberOfCards > 20)
            {
                throw new BadRequestException("Number of cards must be between 3 and 20");
            }
        }

        private string SanitizeText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return string.Empty;
            }

            // Remove excessive whitespace
            text = Regex.Replace(text, @"\s+", " ");
            
            // Trim to reasonable length if needed (prevent token limits)
            const int maxLength = 12000; // Adjust based on model token limits
            if (text.Length > maxLength)
            {
                _logger.LogWarning("Input text exceeded maximum length of {MaxLength} and was truncated", maxLength);
                text = text.Substring(0, maxLength);
            }
            
            return text.Trim();
        }

        private string CreatePrompt(string sanitizedText, int numberOfCards)
        {
            return $@"Create {numberOfCards} flashcards from this text. Each flashcard should have a question (front) and answer (back).
The cards should cover the most important concepts from the text. Focus on creating clear, concise, and educational flashcards.

FORMAT: Return a valid JSON array of flashcards with 'front' and 'back' properties.
EXAMPLE: [{{""front"":""What is the capital of France?"",""back"":""Paris""}}]

TEXT TO PROCESS:
{sanitizedText}";
        }

        private async Task<string> MakeRequestToOpenRouter(
            string prompt, 
            string? modelName, 
            string? apiKey,
            CancellationToken cancellationToken)
        {
            var model = modelName ?? DefaultModelName;
            var apiKeyToUse = !string.IsNullOrEmpty(apiKey) ? apiKey : _options.ApiKey;

            if (string.IsNullOrEmpty(apiKeyToUse))
            {
                throw new InvalidOperationException("No API key provided for OpenRouter");
            }

            var requestBody = new OpenRouterRequest
            {
                Model = model,
                Messages = new List<ChatMessage>
                {
                    new ChatMessage { Role = "system", Content = "You are a helpful assistant specialized in creating educational flashcards." },
                    new ChatMessage { Role = "user", Content = prompt }
                },
                Temperature = 0.7f,
                MaxTokens = 4000,
                ResponseFormat = new ResponseFormat { Type = "json_object" }
            };

            var requestJson = JsonSerializer.Serialize(requestBody, _jsonOptions);
            using var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            // Set required headers for the request
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKeyToUse}");
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", _options.Referer);
            _httpClient.DefaultRequestHeaders.Add("X-Title", _options.Title);

            try
            {
                _logger.LogDebug("Sending request to OpenRouter API: {RequestJson}", requestJson);
                var response = await _httpClient.PostAsync("/api/v1/chat/completions", content, cancellationToken);
                
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("OpenRouter API returned error: {StatusCode} {Content}", 
                        response.StatusCode, responseContent);
                    
                    throw new ExternalServiceException(
                        $"Failed to communicate with OpenRouter API: {response.StatusCode} - {responseContent}");
                }
                
                _logger.LogDebug("Received response from OpenRouter API: {Response}", responseContent);
                return responseContent;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Error making request to OpenRouter API");
                throw new ExternalServiceException("Failed to communicate with OpenRouter API", ex);
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                _logger.LogError(ex, "Request to OpenRouter API timed out");
                throw new ExternalServiceException("Request to OpenRouter API timed out", ex);
            }
        }

        private AIGenerationResult ParseResponseToFlashcards(string responseJson)
        {
            try
            {
                _logger.LogDebug("Parsing response JSON: {ResponseJson}", responseJson);
                var response = JsonSerializer.Deserialize<OpenRouterResponse>(responseJson, _jsonOptions);
                
                if (response?.Choices == null || response.Choices.Count == 0)
                {
                    throw new ExternalServiceException("No response content returned from OpenRouter API");
                }

                var content = response.Choices[0].Message.Content;
                if (string.IsNullOrWhiteSpace(content))
                {
                    throw new ExternalServiceException("Empty content returned from OpenRouter API");
                }

                return ExtractFlashcardsFromContent(content);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse OpenRouter API response: {Response}", responseJson);
                throw new ExternalServiceException("Failed to parse response from AI service", ex);
            }
        }

        private AIGenerationResult ExtractFlashcardsFromContent(string content)
        {
            try
            {
                // First approach: Try to parse the entire content as a JSON array of flashcards
                if (TryDeserializeFlashcards(content, out var flashcards) && flashcards.Count > 0)
                {
                    return CreateGenerationResult(flashcards);
                }

                // Second approach: Try to extract a JSON array from the content
                var arrayMatch = Regex.Match(content, @"\[(.*?)\]", RegexOptions.Singleline);
                if (arrayMatch.Success && TryDeserializeFlashcards(arrayMatch.Value, out flashcards) && flashcards.Count > 0)
                {
                    return CreateGenerationResult(flashcards);
                }

                // Third approach: Look for a JSON object with a flashcards property
                var objectMatch = Regex.Match(content, @"\{.*?""flashcards"".*?\}", RegexOptions.Singleline);
                if (objectMatch.Success)
                {
                    try
                    {
                        var container = JsonSerializer.Deserialize<FlashcardsContainer>(objectMatch.Value, _jsonOptions);
                        if (container?.Flashcards != null && container.Flashcards.Count > 0)
                        {
                            return CreateGenerationResult(container.Flashcards, container.Tags, container.Categories);
                        }
                    }
                    catch (JsonException)
                    {
                        _logger.LogWarning("Failed to parse JSON container, continuing with other extraction methods");
                    }
                }

                // If all else fails, manually extract flashcards from the content
                var manualResult = ManuallyExtractFlashcards(content);
                if (manualResult.Flashcards.Count > 0)
                {
                    return manualResult;
                }

                throw new ExternalServiceException("Could not extract valid flashcards from API response");
            }
            catch (Exception ex) when (ex is not ExternalServiceException)
            {
                _logger.LogError(ex, "Error extracting flashcards from content: {Content}", content);
                throw new ExternalServiceException("Failed to extract flashcards from API response", ex);
            }
        }

        private bool TryDeserializeFlashcards(string json, out List<FlashcardData> flashcards)
        {
            flashcards = new List<FlashcardData>();
            try
            {
                var data = JsonSerializer.Deserialize<List<FlashcardData>>(json, _jsonOptions);
                if (data != null)
                {
                    flashcards = data;
                    return true;
                }
            }
            catch (JsonException)
            {
                _logger.LogDebug("Failed to deserialize as flashcard array: {Json}", json);
            }
            
            return false;
        }

        private AIGenerationResult CreateGenerationResult(
            List<FlashcardData> flashcards,
            List<string>? tags = null,
            List<string>? categories = null)
        {
            return new AIGenerationResult
            {
                Flashcards = flashcards.ConvertAll(fc => new CreateFlashcardDto
                {
                    Front = fc.Front,
                    Back = fc.Back,
                    CreationSource = FlashcardCreationSource.AI,
                    ReviewStatus = ReviewStatus.New
                }),
                Tags = tags ?? new List<string>(),
                Categories = categories ?? new List<string>()
            };
        }

        private AIGenerationResult ManuallyExtractFlashcards(string content)
        {
            var result = new AIGenerationResult
            {
                Flashcards = new List<CreateFlashcardDto>(),
                Tags = new List<string>(),
                Categories = new List<string>()
            };

            // Look for patterns like "Front/Question: ... Back/Answer: ..."
            var frontBackPatterns = new[]
            {
                @"(?:Front|Question)[^\w\d]*:?\s*[""']?(.*?)[""']?\s*(?:Back|Answer)[^\w\d]*:?\s*[""']?(.*?)[""']?(?=\s*(?:Front|Question|$))",
                @"(?:\d+[\.\)]\s+)?(?:Front|Question)[^\w\d]*:?\s*[""']?(.*?)[""']?\s*(?:Back|Answer)[^\w\d]*:?\s*[""']?(.*?)[""']?(?=\s*(?:\d+[\.\)]|$))"
            };

            foreach (var pattern in frontBackPatterns)
            {
                var matches = Regex.Matches(content, pattern, RegexOptions.Singleline);
                foreach (Match match in matches)
                {
                    if (match.Groups.Count >= 3)
                    {
                        var front = match.Groups[1].Value.Trim();
                        var back = match.Groups[2].Value.Trim();
                        
                        if (!string.IsNullOrWhiteSpace(front) && !string.IsNullOrWhiteSpace(back))
                        {
                            result.Flashcards.Add(new CreateFlashcardDto
                            {
                                Front = front,
                                Back = back,
                                CreationSource = FlashcardCreationSource.AI,
                                ReviewStatus = ReviewStatus.New
                            });
                        }
                    }
                }

                if (result.Flashcards.Count > 0)
                {
                    _logger.LogInformation("Manually extracted {Count} flashcards using pattern: {Pattern}", 
                        result.Flashcards.Count, pattern);
                    break;
                }
            }

            return result;
        }

        #region Request/Response Models

        private class ChatMessage
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = string.Empty;

            [JsonPropertyName("content")]
            public string Content { get; set; } = string.Empty;
        }

        private class ResponseFormat
        {
            [JsonPropertyName("type")]
            public string Type { get; set; } = "json_object";
        }

        private class OpenRouterRequest
        {
            [JsonPropertyName("model")]
            public string Model { get; set; } = string.Empty;

            [JsonPropertyName("messages")]
            public List<ChatMessage> Messages { get; set; } = new();

            [JsonPropertyName("temperature")]
            public float Temperature { get; set; } = 0.7f;

            [JsonPropertyName("max_tokens")]
            public int MaxTokens { get; set; } = 4000;

            [JsonPropertyName("response_format")]
            public ResponseFormat? ResponseFormat { get; set; }
        }

        private class FlashcardData
        {
            [JsonPropertyName("front")]
            public string Front { get; set; } = string.Empty;

            [JsonPropertyName("back")]
            public string Back { get; set; } = string.Empty;
        }

        private class FlashcardsContainer
        {
            [JsonPropertyName("flashcards")]
            public List<FlashcardData> Flashcards { get; set; } = new();

            [JsonPropertyName("tags")]
            public List<string> Tags { get; set; } = new();

            [JsonPropertyName("categories")]
            public List<string> Categories { get; set; } = new();
        }

        private class OpenRouterResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("choices")]
            public List<Choice> Choices { get; set; } = new();

            public class Choice
            {
                [JsonPropertyName("message")]
                public Message Message { get; set; } = new();
            }

            public class Message
            {
                [JsonPropertyName("content")]
                public string Content { get; set; } = string.Empty;
            }
        }
        #endregion
    }
} 