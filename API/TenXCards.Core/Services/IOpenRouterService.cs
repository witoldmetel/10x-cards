using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TenXCards.Core.Models;

namespace TenXCards.Core.Services
{
    /// <summary>
    /// Interface for OpenRouter API communication service
    /// </summary>
    public interface IOpenRouterService
    {
        /// <summary>
        /// The API endpoint for OpenRouter
        /// </summary>
        string ApiEndpoint { get; }
        
        /// <summary>
        /// The default model name
        /// </summary>
        string DefaultModelName { get; }
        
        /// <summary>
        /// Default parameters for OpenRouter requests
        /// </summary>
        IReadOnlyDictionary<string, object> DefaultParameters { get; }
        
        /// <summary>
        /// Gets a chat response from the OpenRouter API
        /// </summary>
        /// <param name="userMessage">The user message to send</param>
        /// <param name="systemMessage">Optional system message to include</param>
        /// <param name="modelName">Optional model name to use (defaults to DefaultModelName)</param>
        /// <param name="parameters">Optional additional parameters to include</param>
        /// <param name="responseFormat">Optional response format specification</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>The formatted response from OpenRouter</returns>
        Task<string> GetChatResponseAsync(
            string userMessage,
            string? systemMessage = null,
            string? modelName = null,
            Dictionary<string, object>? parameters = null,
            ResponseFormat? responseFormat = null,
            CancellationToken cancellationToken = default);
    }
} 