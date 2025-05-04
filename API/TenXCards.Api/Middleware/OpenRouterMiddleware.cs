using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace TenXCards.API.Middleware
{
    public class OpenRouterMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly ILogger<OpenRouterMiddleware> _logger;
        private static readonly TimeSpan _defaultCacheDuration = TimeSpan.FromMinutes(30);

        public OpenRouterMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            ILogger<OpenRouterMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only intercept calls to our AI generation endpoints
            if (ShouldProcessRequest(context.Request))
            {
                string cacheKey = GetCacheKey(context.Request);
                
                // Check if we have a cached response
                if (_cache.TryGetValue(cacheKey, out var cachedResponse))
                {
                    _logger.LogInformation("Serving cached OpenRouter response for {Path}", context.Request.Path);
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(cachedResponse?.ToString() ?? "{}");
                    return;
                }
                
                // Save the original response body stream
                var originalBodyStream = context.Response.Body;
                
                try
                {
                    // Create a new memory stream to capture the response
                    using var responseBody = new MemoryStream();
                    context.Response.Body = responseBody;
                    
                    // Continue processing the request
                    await _next(context);
                    
                    // If successful, cache the response
                    if (context.Response.StatusCode == StatusCodes.Status200OK)
                    {
                        responseBody.Seek(0, SeekOrigin.Begin);
                        using var reader = new StreamReader(responseBody);
                        string responseText = await reader.ReadToEndAsync();
                        
                        // Cache the response
                        _cache.Set(cacheKey, responseText, _defaultCacheDuration);
                        
                        // Reset the stream position
                        responseBody.Seek(0, SeekOrigin.Begin);
                    }
                    
                    // Copy the response to the original stream
                    await responseBody.CopyToAsync(originalBodyStream);
                }
                finally
                {
                    // Restore the original response body
                    context.Response.Body = originalBodyStream;
                }
            }
            else
            {
                // For other requests, continue the pipeline
                await _next(context);
            }
        }

        private bool ShouldProcessRequest(HttpRequest request)
        {
            return request.Method == "POST" && 
                   (request.Path.StartsWithSegments("/api/flashcards/generate") ||
                    request.Path.Value?.EndsWith("/flashcards/generate") == true);
        }

        private string GetCacheKey(HttpRequest request)
        {
            // Read the request body
            request.EnableBuffering();
            string requestBody;
            
            using (var reader = new StreamReader(request.Body, Encoding.UTF8, true, 1024, true))
            {
                requestBody = reader.ReadToEndAsync().Result;
            }
            
            // Reset the request body position
            request.Body.Position = 0;
            
            // Create a hash from the request path and body
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes($"{request.Path}:{requestBody}");
            var hash = sha256.ComputeHash(bytes);
            
            return Convert.ToBase64String(hash);
        }
    }
} 