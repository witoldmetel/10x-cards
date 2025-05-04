using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using TenXCards.Core.DTOs;
using TenXCards.Core.Exceptions;
using TenXCards.Core.Models;
using TenXCards.Infrastructure.Services;
using Xunit;

namespace TenXCards.Tests.Services
{
    public class OpenRouterServiceTests
    {
        private readonly Mock<IOptions<OpenRouterOptions>> _mockOptions;
        private readonly Mock<ILogger<OpenRouterService>> _mockLogger;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly OpenRouterOptions _options;

        public OpenRouterServiceTests()
        {
            _options = new OpenRouterOptions
            {
                ApiKey = "test-api-key",
                BaseUrl = "https://openrouter.ai",
                DefaultModel = "openai/gpt-3.5-turbo",
                Referer = "https://test.com",
                Title = "Test App"
            };

            _mockOptions = new Mock<IOptions<OpenRouterOptions>>();
            _mockOptions.Setup(o => o.Value).Returns(_options);
            _mockLogger = new Mock<ILogger<OpenRouterService>>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_ValidRequest_ReturnsFlashcards()
        {
            // Arrange
            var mockResponse = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(GetSampleSuccessResponse())
            };

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(mockResponse);

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act
            var result = await service.GenerateFlashcardsAsync(
                "Test source text about artificial intelligence and machine learning.",
                3,
                null,
                null,
                CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.Flashcards);
            Assert.Equal(2, result.Flashcards.Count);
            Assert.Equal("What is artificial intelligence?", result.Flashcards[0].Front);
            Assert.Equal("A field of computer science focused on creating machines that can perform tasks requiring human intelligence.", result.Flashcards[0].Back);
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_EmptySourceText_ThrowsBadRequestException()
        {
            // Arrange
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                service.GenerateFlashcardsAsync(
                    string.Empty,
                    3,
                    null,
                    null,
                    CancellationToken.None));
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_InvalidNumberOfCards_ThrowsBadRequestException()
        {
            // Arrange
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<BadRequestException>(() =>
                service.GenerateFlashcardsAsync(
                    "Valid source text",
                    30, // More than the max allowed
                    null,
                    null,
                    CancellationToken.None));
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_ApiError_ThrowsExternalServiceException()
        {
            // Arrange
            var mockResponse = new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.BadGateway,
                Content = new StringContent("{\"error\":\"Invalid request to OpenAI API\"}")
            };

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(mockResponse);

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<ExternalServiceException>(() =>
                service.GenerateFlashcardsAsync(
                    "Valid source text",
                    3,
                    null,
                    null,
                    CancellationToken.None));
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_WithCustomModel_UsesSpecifiedModel()
        {
            // Arrange
            var customModel = "openai/gpt-4";
            HttpRequestMessage capturedRequest = null;

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((request, _) => capturedRequest = request)
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(GetSampleSuccessResponse())
                });

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act
            await service.GenerateFlashcardsAsync(
                "Test source text",
                3,
                customModel,
                null,
                CancellationToken.None);

            // Assert
            Assert.NotNull(capturedRequest);
            var content = await capturedRequest.Content.ReadAsStringAsync();
            Assert.Contains(customModel, content);
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_WithCustomApiKey_UsesSpecifiedApiKey()
        {
            // Arrange
            var customApiKey = "custom-api-key";
            HttpRequestMessage capturedRequest = null;

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((request, _) => capturedRequest = request)
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(GetSampleSuccessResponse())
                });

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act
            await service.GenerateFlashcardsAsync(
                "Test source text",
                3,
                null,
                customApiKey,
                CancellationToken.None);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal("Bearer " + customApiKey, capturedRequest.Headers.Authorization.ToString());
        }

        private string GetSampleSuccessResponse()
        {
            return @"{
                ""id"": ""chatcmpl-123"",
                ""object"": ""chat.completion"",
                ""created"": 1678667132,
                ""model"": ""gpt-3.5-turbo-0301"",
                ""choices"": [
                    {
                        ""index"": 0,
                        ""message"": {
                            ""role"": ""assistant"",
                            ""content"": ""[{
                                \""front\"": \""What is artificial intelligence?\"",
                                \""back\"": \""A field of computer science focused on creating machines that can perform tasks requiring human intelligence.\""
                              }, {
                                \""front\"": \""What is machine learning?\"",
                                \""back\"": \""A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.\""
                              }]""
                        },
                        ""finish_reason"": ""stop""
                    }
                ],
                ""usage"": {
                    ""prompt_tokens"": 10,
                    ""completion_tokens"": 20,
                    ""total_tokens"": 30
                }
            }";
        }
    }
} 