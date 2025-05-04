using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services
{
    public interface IOpenRouterService
    {
        string ApiEndpoint { get; }
        string DefaultModelName { get; }
        IReadOnlyDictionary<string, object> DefaultParameters { get; }
        
        Task<string> GetChatResponseAsync(
            string userMessage,
            string? systemMessage = null,
            string? modelName = null,
            Dictionary<string, object>? parameters = null,
            ResponseFormat? responseFormat = null,
            CancellationToken cancellationToken = default);
            
        Task<GeneratedFlashcardsContent> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? systemMessage = null,
            string? modelName = null,
            CancellationToken cancellationToken = default);
    }
    
    public class ResponseFormat
    {
        public string Type { get; set; } = "json_object";
    }
} 