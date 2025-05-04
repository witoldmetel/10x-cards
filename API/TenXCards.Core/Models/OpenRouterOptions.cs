namespace TenXCards.Core.Models
{
    public class OpenRouterOptions
    {
        public const string SectionName = "OpenRouter";
        
        public string ApiKey { get; set; } = string.Empty;
        public string? DefaultModel { get; set; } = "gpt-4o-mini";
        public string? SiteName { get; set; }
        public string? SiteUrl { get; set; }
        public int TimeoutSeconds { get; set; } = 60;
    }
} 