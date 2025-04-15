using System;

namespace TenXCards.Api.Data.Models
{
    public class Card
    {
        public int Id { get; set; }
        public required string Question { get; set; }
        public required string Answer { get; set; }
        public required string ReviewStatus { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public bool Archived { get; set; }
        public string[]? Tags { get; set; }
        public string[]? Categories { get; set; }
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public decimal Sm2Efactor { get; set; } = 2.5m;
        public DateTime? Sm2DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 