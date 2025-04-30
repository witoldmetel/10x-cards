using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace TenXCards.Core.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum FlashcardCreationSource
    {
        Manual,
        AI
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
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
        public Guid UserId { get; set; }
        public Guid CollectionId { get; set; }
        public required string Front { get; set; }
        public required string Back { get; set; }
        public ReviewStatus ReviewStatus { get; set; }
        public FlashcardCreationSource CreationSource { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        
        // SM2 Algorithm fields
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public double Sm2Efactor { get; set; } = 2.5;
        public DateTime? Sm2DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Collection? Collection { get; set; }
    }
} 