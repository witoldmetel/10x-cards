using Microsoft.Extensions.Options;

namespace TenXCards.Core.Models
{
    public class OpenRouterOptions
    {
        public const string SectionName = "OpenRouter";
        
        public string BaseUrl { get; set; } = "https://openrouter.ai/api/v1";
        public string ApiEndpoint { get; set; } = "/chat/completions";
        public string ApiKey { get; set; } = string.Empty;
        public string DefaultModel { get; set; } = "openai/gpt-3.5-turbo";
        public string SiteUrl { get; set; } = "https://github.com/10xCards/FlashCard";
        public string SiteName { get; set; } = "FlashCard";
        public int TimeoutSeconds { get; set; } = 120;
    }
    
    public class OpenRouterOptionsValidator : IValidateOptions<OpenRouterOptions>
{
    public ValidateOptionsResult Validate(string? name, OpenRouterOptions options)
    {
        if (string.IsNullOrEmpty(options.ApiKey))
        {
            return ValidateOptionsResult.Fail("OpenRouter API key is required");
        }

        if (string.IsNullOrEmpty(options.BaseUrl))
        {
            return ValidateOptionsResult.Fail("OpenRouter base URL is required");
        }

        if (!Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail("OpenRouter base URL must be a valid absolute URI");
        }

        if (string.IsNullOrEmpty(options.DefaultModel))
        {
            return ValidateOptionsResult.Fail("OpenRouter default model is required");
        }

        if (options.TimeoutSeconds <= 0)
        {
            return ValidateOptionsResult.Fail("OpenRouter timeout must be greater than 0 seconds");
        }

        return ValidateOptionsResult.Success;
    }
} 
} 