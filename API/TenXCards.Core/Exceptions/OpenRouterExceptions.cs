using System;

namespace TenXCards.Core.Exceptions
{
    /// <summary>
    /// Base exception for all OpenRouter-related exceptions
    /// </summary>
    public class OpenRouterException : Exception
    {
        public OpenRouterException(string message) : base(message)
        {
        }

        public OpenRouterException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    /// <summary>
    /// Exception thrown when there is an authentication issue with OpenRouter API
    /// </summary>
    public class OpenRouterAuthenticationException : OpenRouterException
    {
        public OpenRouterAuthenticationException(string message) : base(message)
        {
        }
    }

    /// <summary>
    /// Exception thrown when there is a communication issue with OpenRouter API
    /// </summary>
    public class OpenRouterCommunicationException : OpenRouterException
    {
        public int StatusCode { get; }

        public OpenRouterCommunicationException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    /// <summary>
    /// Exception thrown when there is a validation issue with OpenRouter API request or response
    /// </summary>
    public class OpenRouterValidationException : OpenRouterException
    {
        public OpenRouterValidationException(string message) : base(message)
        {
        }

        public OpenRouterValidationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
} 