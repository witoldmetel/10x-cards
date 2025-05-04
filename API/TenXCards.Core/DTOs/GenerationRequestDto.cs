namespace TenXCards.Core.DTOs
{
    public class GenerationRequestDto
    {
        public string SourceText { get; set; } = string.Empty;
        public int NumberOfCards { get; set; } = 5;
        public string? ApiModelKey { get; set; }
        public Guid? CollectionId { get; set; }
    }
} 