using System;
using System.Collections.Generic;

namespace TenXCards.Core.Models
{
    public class Collection
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public int TotalCards { get; set; } = 0;
        public int DueCards { get; set; } = 0;
        public DateTime? LastStudied { get; set; }
        public double MasteryLevel { get; set; } = 0;
        public required string Color { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        
        // Navigation properties
        public User? User { get; set; }
        public List<Flashcard> Flashcards { get; set; } = new();
    }
}
