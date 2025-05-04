namespace TenXCards.Core.Models
{
    public class OpenRouterOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://openrouter.ai";
        public string DefaultModel { get; set; } = "openai/gpt-4o-mini";
        public string Referer { get; set; } = "https://10x-cards.com";
        public string Title { get; set; } = "10X Cards";
    }
} 