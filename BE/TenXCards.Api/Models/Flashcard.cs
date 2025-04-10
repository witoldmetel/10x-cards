using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace TenXCards.Api.Models
{
    [Table("flashcards")]
    public class Flashcard : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; }

        [Column("question")]
        public string Question { get; set; }

        [Column("answer")]
        public string Answer { get; set; }

        [Column("category")]
        public string Category { get; set; }

        [Column("tags")]
        public string[] Tags { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("last_reviewed_at")]
        public DateTime? LastReviewedAt { get; set; }

        [Column("next_review_at")]
        public DateTime? NextReviewAt { get; set; }

        [Column("repetition_count")]
        public int RepetitionCount { get; set; }

        [Column("easiness_factor")]
        public float EasinessFactor { get; set; } = 2.5f;

        [Column("interval")]
        public int Interval { get; set; }

        [Column("is_archived")]
        public bool IsArchived { get; set; }

        [Column("user_id")]
        public string UserId { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
} 