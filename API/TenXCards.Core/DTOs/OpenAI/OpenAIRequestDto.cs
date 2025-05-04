namespace TenXCards.Core.DTOs.OpenAI
{
    public class OpenAIRequestDto
    {
        public required string Model { get; set; }
        public required List<Message> Messages { get; set; }
        public float Temperature { get; set; } = 0.7f;
        public int MaxTokens { get; set; } = 1000;
        public string ResponseFormat { get; set; } = "json_object";

        public class Message
        {
            public required string Role { get; set; }
            public required string Content { get; set; }
        }
    }
} 