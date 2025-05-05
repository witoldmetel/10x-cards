using System.Text.Json.Serialization;

namespace TenXCards.Core.Models
{
    public record Message
    {
        [JsonPropertyName("role")]
        public string Role { get; init; } = string.Empty;

        [JsonPropertyName("content")]
        public string Content { get; init; } = string.Empty;
    }

    public record ResponseFormat
    {
        [JsonPropertyName("type")]
        public string Type { get; init; } = "json_object";
    }

    public record OpenRouterRequest
    {
        [JsonPropertyName("model")]
        public string Model { get; init; } = string.Empty;

        [JsonPropertyName("messages")]
        public List<Message> Messages { get; init; } = new();

        [JsonPropertyName("temperature")]
        public double Temperature { get; init; } = 0.7;

        [JsonPropertyName("top_p")]
        public double TopP { get; init; } = 0.95;

        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; init; } = 750;

        [JsonPropertyName("response_format")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public ResponseFormat? ResponseFormat { get; init; }
    }

    public record OpenRouterResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        [JsonPropertyName("choices")]
        public List<Choice> Choices { get; init; } = new();

        [JsonPropertyName("usage")]
        public Usage? Usage { get; init; }
    }

    public record Choice
    {
        [JsonPropertyName("message")]
        public Message? Message { get; init; }

        [JsonPropertyName("index")]
        public int Index { get; init; }

        [JsonPropertyName("finish_reason")]
        public string? FinishReason { get; init; }
    }

    public record Usage
    {
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; init; }

        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; init; }

        [JsonPropertyName("total_tokens")]
        public int TotalTokens { get; init; }
    }
} 