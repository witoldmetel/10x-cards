using System.ComponentModel.DataAnnotations;

namespace TenXCards.Api.DTOs
{
    /// <summary>
    /// Base DTO containing common flashcard properties
    /// </summary>
    public abstract class FlashcardBaseDto
    {
        /// <summary>
        /// The question text of the flashcard
        /// </summary>
        [Required(ErrorMessage = "Question is required")]
        [MinLength(3, ErrorMessage = "Question must be at least 3 characters")]
        [MaxLength(1000, ErrorMessage = "Question cannot exceed 1000 characters")]
        public string Question { get; set; } = string.Empty;

        /// <summary>
        /// The answer text of the flashcard
        /// </summary>
        [Required(ErrorMessage = "Answer is required")]
        [MinLength(3, ErrorMessage = "Answer must be at least 3 characters")]
        [MaxLength(2000, ErrorMessage = "Answer cannot exceed 2000 characters")]
        public string Answer { get; set; } = string.Empty;

        /// <summary>
        /// The current review status of the flashcard
        /// </summary>
        [Required(ErrorMessage = "Review status is required")]
        [MaxLength(50, ErrorMessage = "Review status cannot exceed 50 characters")]
        public string ReviewStatus { get; set; } = string.Empty;

        /// <summary>
        /// Tags associated with the flashcard for categorization
        /// </summary>
        public string[]? Tags { get; set; }

        /// <summary>
        /// Categories the flashcard belongs to
        /// </summary>
        public string[]? Categories { get; set; }
    }

    /// <summary>
    /// DTO for creating a new flashcard
    /// </summary>
    public class CreateFlashcardRequest : FlashcardBaseDto
    {
        // Inherits all base properties
        // Add any additional properties specific to creation
    }

    /// <summary>
    /// DTO for updating an existing flashcard
    /// </summary>
    public class UpdateFlashcardRequest : FlashcardBaseDto
    {
        /// <summary>
        /// Whether the flashcard is archived
        /// </summary>
        public bool Archived { get; set; }

        /// <summary>
        /// Optional archive date
        /// </summary>
        public DateTime? ArchivedAt { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm repetition count
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "SM2 repetitions must be non-negative")]
        public int Sm2Repetitions { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm interval
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "SM2 interval must be non-negative")]
        public int Sm2Interval { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm E-Factor
        /// </summary>
        [Range(1.3, 2.5, ErrorMessage = "SM2 E-Factor must be between 1.3 and 2.5")]
        public decimal Sm2Efactor { get; set; } = 2.5m;

        /// <summary>
        /// Next due date for review based on SM2 algorithm
        /// </summary>
        public DateTime? Sm2DueDate { get; set; }
    }

    /// <summary>
    /// DTO for returning flashcard data in API responses
    /// </summary>
    public class FlashcardResponse : FlashcardBaseDto
    {
        /// <summary>
        /// Unique identifier of the flashcard
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Whether the flashcard is archived
        /// </summary>
        public bool Archived { get; set; }

        /// <summary>
        /// When the flashcard was archived, if applicable
        /// </summary>
        public DateTime? ArchivedAt { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm properties for spaced repetition
        /// </summary>
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public decimal Sm2Efactor { get; set; }
        public DateTime? Sm2DueDate { get; set; }

        /// <summary>
        /// Audit properties
        /// </summary>
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid UserId { get; set; }
    }

    /// <summary>
    /// DTO for filtering flashcards in list operations
    /// </summary>
    public class FlashcardFilterRequest
    {
        /// <summary>
        /// Filter by review status
        /// </summary>
        public string? ReviewStatus { get; set; }

        /// <summary>
        /// Include archived flashcards
        /// </summary>
        public bool? IncludeArchived { get; set; }

        /// <summary>
        /// Filter by tags
        /// </summary>
        public string[]? Tags { get; set; }

        /// <summary>
        /// Filter by categories
        /// </summary>
        public string[]? Categories { get; set; }

        /// <summary>
        /// Filter by due date range
        /// </summary>
        public DateTime? DueDateFrom { get; set; }
        public DateTime? DueDateTo { get; set; }
    }
} 