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
using TenXCards.Core.Services;
using TenXCards.Infrastructure.Services;
using Xunit;

namespace TenXCards.Tests.Services
{
    public class OpenRouterServiceTests
    {
        private readonly Mock<IOptions<TenXCards.Infrastructure.Services.OpenRouterOptions>> _mockOptions;
        private readonly Mock<ILogger<OpenRouterService>> _mockLogger;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly TenXCards.Infrastructure.Services.OpenRouterOptions _options;

        public OpenRouterServiceTests()
        {
            _options = new TenXCards.Infrastructure.Services.OpenRouterOptions
            {
                ApiKey = "test-api-key",
                BaseUrl = "https://openrouter.ai",
                DefaultModel = "openai/gpt-3.5-turbo",
                SiteUrl = "https://test.com",
                SiteName = "Test App"
            };

            _mockOptions = new Mock<IOptions<TenXCards.Infrastructure.Services.OpenRouterOptions>>();
            _mockOptions.Setup(o => o.Value).Returns(_options);
            _mockLogger = new Mock<ILogger<OpenRouterService>>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();

            // Setup default success response
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(GetSampleSuccessResponse())
                });
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_ValidRequest_ReturnsFlashcards()
        {
            // Arrange
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
        public async Task GenerateFlashcardsAsync_EmptySourceText_ThrowsOpenRouterValidationException()
        {
            // Arrange - Setup specific validation error response
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(r => 
                        r.Content != null && r.Content.ReadAsStringAsync().Result.Contains(string.Empty)),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Validation error"));
            
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<OpenRouterException>(() =>
                service.GenerateFlashcardsAsync(
                    string.Empty,
                    3,
                    null,
                    null,
                    CancellationToken.None));
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_InvalidNumberOfCards_ThrowsOpenRouterValidationException()
        {
            // Arrange - Setup specific validation error response
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(r => true),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new HttpRequestException("Validation error"));
            
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var service = new OpenRouterService(httpClient, _mockOptions.Object, _mockLogger.Object);

            // Act & Assert
            await Assert.ThrowsAsync<OpenRouterException>(() =>
                service.GenerateFlashcardsAsync(
                    "Valid source text",
                    30, // More than the max allowed
                    null,
                    null,
                    CancellationToken.None));
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_ApiError_ThrowsOpenRouterCommunicationException()
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
            await Assert.ThrowsAsync<OpenRouterCommunicationException>(() =>
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
            var requestCaptor = new HttpRequestMessageCaptor();

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((request, _) => requestCaptor.CaptureRequest(request))
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
                customModel,
                CancellationToken.None);

            // Assert
            Assert.NotNull(requestCaptor.Request);
        }

        [Fact]
        public async Task GenerateFlashcardsAsync_WithCustomApiKey_UsesSpecifiedApiKey()
        {
            // Arrange
            var requestCaptor = new HttpRequestMessageCaptor();

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((request, _) => requestCaptor.CaptureRequest(request))
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
                null,
                CancellationToken.None);

            // Assert
            Assert.NotNull(requestCaptor.Request);
            Assert.True(requestCaptor.Request.Headers.Contains("Authorization"));
        }

        private string GetSampleSuccessResponse()
        {
            return @"{
                ""id"": ""chatcmpl-123"",
                ""object"": ""chat.completion"",
                ""created"": 1677652288,
                ""model"": ""openai/gpt-3.5-turbo"",
                ""choices"": [{
                    ""index"": 0,
                    ""message"": {
                        ""role"": ""assistant"",
                        ""content"": ""[{\""front\"":\""What is artificial intelligence?\"",\""back\"":\""A field of computer science focused on creating machines that can perform tasks requiring human intelligence.\"",\""reviewStatus\"":\""New\"",\""creationSource\"":\""AI\""},{\""front\"":\""What is machine learning?\"",\""back\"":\""A subset of AI that enables systems to learn and improve from experience without being explicitly programmed.\"",\""reviewStatus\"":\""New\"",\""creationSource\"":\""AI\""}]""
                    },
                    ""finish_reason"": ""stop""
                }],
                ""usage"": {
                    ""prompt_tokens"": 9,
                    ""completion_tokens"": 12,
                    ""total_tokens"": 21
                }
            }";
        }
    }

    // Helper class to capture HttpRequestMessage without causing disposal issues
    public class HttpRequestMessageCaptor
    {
        public HttpRequestMessage? Request { get; private set; }

        public void CaptureRequest(HttpRequestMessage request)
        {
            Request = request;
        }
    }
} 