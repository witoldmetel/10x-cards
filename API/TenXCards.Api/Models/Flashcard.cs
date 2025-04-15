using System.ComponentModel.DataAnnotations;
using Postgrest.Attributes;
using Postgrest.Models;

namespace TenXCards.Api.Models
{
    /// <summary>
    /// Represents a flashcard entity in the database
    /// </summary>
    [Table("flashcards")]
    public class Flashcard : BaseModel
    {
        [PrimaryKey("id", false)]
        public string? Id { get; set; }

        [Required]
        [Column("question")]
        [StringLength(1000)]
        public string Question { get; set; } = string.Empty;

        [Required]
        [Column("answer")]
        [StringLength(2000)]
        public string Answer { get; set; } = string.Empty;

        [Required]
        [Column("review_status")]
        [StringLength(50)]
        public string ReviewStatus { get; set; } = string.Empty;

        [Column("archived_at")]
        public DateTime? ArchivedAt { get; set; }

        [Column("archived")]
        public bool Archived { get; set; }

        [Column("tag")]
        public string[]? Tag { get; set; }

        [Column("category")]
        public string[]? Category { get; set; }

        [Column("sm2_repetitions")]
        [Range(0, int.MaxValue)]
        public int Sm2Repetitions { get; set; }

        [Column("sm2_interval")]
        [Range(0, int.MaxValue)]
        public int Sm2Interval { get; set; }

        [Column("sm2_efactor")]
        [Range(1.3, 2.5)]
        public decimal Sm2Efactor { get; set; } = 2.5m;

        [Column("sm2_due_date")]
        public DateTime? Sm2DueDate { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
} 