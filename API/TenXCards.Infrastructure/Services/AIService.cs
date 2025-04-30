using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TenXCards.Core.Configuration;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly OpenRouterOptions _options;

        public string DefaultModelName => _options.DefaultModel;

        public AIService(HttpClient httpClient, IOptions<OpenRouterOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;

            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.ApiKey}");
            if (!string.IsNullOrEmpty(_options.SiteUrl))
                _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", _options.SiteUrl);
            if (!string.IsNullOrEmpty(_options.SiteName))
                _httpClient.DefaultRequestHeaders.Add("X-Title", _options.SiteName);
        }

        public async Task<List<CreateFlashcardDto>> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default)
        {
            var prompt = $@"Generate {numberOfCards} flashcards from the following text. Each flashcard should have a question on the front and a concise answer on the back. Also include relevant tags and categories.
Format the output as a JSON array of objects with the following structure:
[{{
    ""front"": ""question"",
    ""back"": ""answer"",
    ""tags"": [""tag1"", ""tag2""],
    ""category"": [""category1"", ""category2""]
}}]

Source text:
{sourceText}";

            var request = new
            {
                model = modelName ?? _options.DefaultModel,
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content = "You are a helpful AI that generates high-quality flashcards from provided text. Focus on key concepts and ensure questions are clear and answers are concise."
                    },
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                }
            };

            if (apiModelKey != null)
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiModelKey}");
            }

            try
            {
                var response = await _httpClient.PostAsJsonAsync("chat/completions", request, cancellationToken);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<OpenRouterResponse>(cancellationToken: cancellationToken);
                if (result?.Choices == null || result.Choices.Count == 0)
                    throw new Exception("No response from AI service");

                var jsonResponse = result.Choices[0].Message.Content;
                var flashcards = JsonSerializer.Deserialize<List<CreateFlashcardDto>>(jsonResponse) ?? 
                    throw new Exception("Failed to parse flashcards from API response");

                // Set creation source for all generated flashcards
                foreach (var flashcard in flashcards)
                {
                    flashcard.CreationSource = FlashcardCreationSource.AI;
                    flashcard.ReviewStatus = ReviewStatus.New;
                }

                return flashcards;
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
