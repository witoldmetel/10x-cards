using System;
using System.Collections.Generic;

namespace TenXCards.Core.Models
{
    public class Collection
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public int TotalCards { get; set; }
        public int DueCards { get; set; }
        public required string Color { get; set; }
        
        // Navigation property
        public List<Flashcard> Flashcards { get; set; } = new();
    }
}
