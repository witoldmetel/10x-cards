using System;
using System.Collections.Generic;

namespace TenXCards.Core.Models
{
    public enum FlashcardCreationSource
    {
        Manual,
        AI
    }

    public enum ReviewStatus
    {
        New,
        ToCorrect,
        Approved,
        Rejected
    }

    public class Flashcard
    {
        public Guid Id { get; set; }
        public string Front { get; set; }
        public string Back { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsArchived { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public FlashcardCreationSource CreationSource { get; set; }
        public ReviewStatus ReviewStatus { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        
        // SM2 Algorithm fields
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public double Sm2Efactor { get; set; } = 2.5;
        public DateTime? Sm2DueDate { get; set; }
    }
} 