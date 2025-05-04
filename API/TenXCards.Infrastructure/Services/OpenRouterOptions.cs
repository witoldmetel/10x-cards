namespace TenXCards.Infrastructure.Services
{
    public class OpenRouterOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.openrouter.ai";
        public string ApiEndpoint { get; set; } = "/api/v1/chat/completions";
        public string DefaultModel { get; set; } = "gpt-4";
        public string SiteUrl { get; set; } = string.Empty;
        public string SiteName { get; set; } = string.Empty;
    }
} 