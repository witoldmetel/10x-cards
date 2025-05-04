using System;
using System.Collections.Generic;

namespace TenXCards.Core.DTOs
{
    public class GenerationResponseDto
    {
        public Guid CollectionId { get; set; }
        public List<FlashcardResponseDto> GeneratedFlashcards { get; set; } = new();
    }
} 