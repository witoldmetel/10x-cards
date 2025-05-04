using System.Collections.Generic;

namespace TenXCards.Core.DTOs
{
    public class GeneratedFlashcardsContent
    {
        public List<CreateFlashcardDto> Flashcards { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
    }
} 