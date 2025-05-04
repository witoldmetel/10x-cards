namespace TenXCards.Core.Configuration
{
    public class OpenRouterOptions
    {
        public const string SectionName = "OpenRouter";
        
        public required string ApiKey { get; set; }
        public required string DefaultModel { get; set; }
        public string? SiteName { get; set; }
        public string? SiteUrl { get; set; }
        public int TimeoutSeconds { get; set; } = 30;
    }
} 