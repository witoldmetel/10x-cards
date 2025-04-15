using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace TenXCards.Api.Models
{
    [Table("flashcards")]
    public class Flashcard : BaseModel
    {
        [PrimaryKey("id", false)]
        public string? Id { get; set; }

        [Column("question")]
        public string? Question { get; set; }

        [Column("answer")]
        public string? Answer { get; set; }

        [Column("review_status")]
        public string? ReviewStatus { get; set; }

        [Column("archived_at")]
        public DateTime? ArchivedAt { get; set; }

        [Column("archived")]
        public bool Archived { get; set; }

        [Column("tag")]
        public string[]? Tag { get; set; }

        [Column("category")]
        public string[]? Category { get; set; }

        [Column("sm2_repetitions")]
        public int Sm2Repetitions { get; set; }

        [Column("sm2_interval")]
        public int Sm2Interval { get; set; }

        [Column("sm2_efactor")]
        public decimal Sm2Efactor { get; set; } = 2.5m;

        [Column("sm2_due_date")]
        public DateTime? Sm2DueDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("user_id")]
        public string? UserId { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
} 