using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenXCards.Api.Models
{
    /// <summary>
    /// Represents a flashcard entity in the database
    /// </summary>
    [Table("flashcards")]
    public class Flashcard
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Question { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Answer { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ReviewStatus { get; set; } = string.Empty;

        public DateTime? ArchivedAt { get; set; }

        public bool Archived { get; set; }

        public string[]? Tag { get; set; }

        public string[]? Category { get; set; }

        public int Sm2Repetitions { get; set; }

        public int Sm2Interval { get; set; }

        public decimal Sm2Efactor { get; set; } = 2.5m;

        public DateTime? Sm2DueDate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public User User { get; set; } = null!;
    }
} 