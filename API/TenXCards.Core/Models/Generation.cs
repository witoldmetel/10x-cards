using System;
using System.Collections.Generic;

namespace TenXCards.Core.Models
{
    public class Generation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Model { get; set; } = string.Empty;
        public string SourceTextHash { get; set; } = string.Empty;
        public int GeneratedCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public virtual ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
    }
} 