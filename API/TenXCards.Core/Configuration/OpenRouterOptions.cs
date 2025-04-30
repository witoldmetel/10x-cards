namespace TenXCards.Core.Configuration
{
    public class OpenRouterOptions
    {
        public const string SectionName = "OpenRouter";
        
        public required string ApiKey { get; set; }
        public required string BaseUrl { get; set; } = "https://openrouter.ai/api/v1";
        public string DefaultModel { get; set; } = "openai/gpt-4";
        public int TimeoutSeconds { get; set; } = 120;
        public string? SiteUrl { get; set; }
        public string? SiteName { get; set; }
    }
} 