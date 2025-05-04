using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TenXCards.Core.Models;

namespace TenXCards.Core.DTOs
{
    /// <summary>
    /// DTO for creating a new flashcard
    /// </summary>
    public class CreateFlashcardDto
    {
        /// <summary>
        /// Front side content of the flashcard
        /// </summary>
        public required string Front { get; set; }

        /// <summary>
        /// Back side content of the flashcard
        /// </summary>
        public required string Back { get; set; }

        /// <summary>
        /// Source of flashcard creation (Manual or AI-generated)
        /// </summary>
        public FlashcardCreationSource CreationSource { get; set; } = FlashcardCreationSource.Manual;

        /// <summary>
        /// Initial review status of the flashcard
        /// </summary>
        public ReviewStatus ReviewStatus { get; set; } = ReviewStatus.Approved;
    }

    /// <summary>
    /// DTO for updating an existing flashcard
    /// </summary>
    public class UpdateFlashcardDto
    {
        /// <summary>
        /// Updated front side content
        /// </summary>
        public string? Front { get; set; }

        /// <summary>
        /// Updated back side content
        /// </summary>
        public string? Back { get; set; }

        /// <summary>
        /// Updated review status
        /// </summary>
        public ReviewStatus? ReviewStatus { get; set; }

        /// <summary>
        /// Archive timestamp
        /// </summary>
        public DateTime? ArchivedAt { get; set; }
    }

    /// <summary>
    /// Response DTO for a flashcard
    /// </summary>
    public class FlashcardResponseDto
    {
        /// <summary>
        /// Unique identifier of the flashcard
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// ID of the user who owns the flashcard
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// ID of the collection this flashcard belongs to
        /// </summary>
        public Guid CollectionId { get; set; }

        /// <summary>
        /// Front side content of the flashcard
        /// </summary>
        public required string Front { get; set; }

        /// <summary>
        /// Back side content of the flashcard
        /// </summary>
        public required string Back { get; set; }

        /// <summary>
        /// Current review status of the flashcard
        /// </summary>
        public ReviewStatus ReviewStatus { get; set; }

        /// <summary>
        /// Last review timestamp
        /// </summary>
        public DateTime? ReviewedAt { get; set; }

        /// <summary>
        /// Source of flashcard creation
        /// </summary>
        public FlashcardCreationSource CreationSource { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm: number of repetitions
        /// </summary>
        public int Sm2Repetitions { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm: interval in days
        /// </summary>
        public int Sm2Interval { get; set; }

        /// <summary>
        /// SuperMemo2 algorithm: easiness factor
        /// </summary>
        public double Sm2Efactor { get; set; }

        /// <summary>
        /// Next review date based on SuperMemo2 algorithm
        /// </summary>
        public DateTime? Sm2DueDate { get; set; }

        /// <summary>
        /// Creation timestamp
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Last update timestamp
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Archive timestamp
        /// </summary>
        public DateTime? ArchivedAt { get; set; }
    }

    /// <summary>
    /// Query parameters for flashcard listing
    /// </summary>
    public class FlashcardsQueryParams
    {
        /// <summary>
        /// Number of items to skip
        /// </summary>
        public int Offset { get; set; } = 0;

        /// <summary>
        /// Maximum number of items to return (1-100)
        /// </summary>
        [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
        public int Limit { get; set; } = 20;

        /// <summary>
        /// Filter by review status
        /// </summary>
        public ReviewStatus? ReviewStatus { get; set; }

        /// <summary>
        /// Search phrase to filter flashcards
        /// </summary>
        public string? SearchPhrase { get; set; }

        /// <summary>
        /// Filter by archived status
        /// </summary>
        public bool? Archived { get; set; }

        /// <summary>
        /// Filter by collection ID
        /// </summary>
        public Guid? CollectionId { get; set; }
    }

    /// <summary>
    /// Generic paginated response
    /// </summary>
    public class PaginatedResponse<T>
    {
        /// <summary>
        /// List of items
        /// </summary>
        public required IEnumerable<T> Items { get; set; }

        /// <summary>
        /// Maximum number of items returned
        /// </summary>
        public int Limit { get; set; }

        /// <summary>
        /// Number of items skipped
        /// </summary>
        public int Offset { get; set; }

        /// <summary>
        /// Total number of items available
        /// </summary>
        public int TotalCount { get; set; }
    }

    /// <summary>
    /// Request for batch updating flashcards
    /// </summary>
    public class BatchUpdateRequest
    {
        /// <summary>
        /// List of flashcard IDs to update
        /// </summary>
        public required List<Guid> FlashcardIds { get; set; }

        /// <summary>
        /// Update to apply to all selected flashcards
        /// </summary>
        public required UpdateFlashcardDto Update { get; set; }
    }

    /// <summary>
    /// Response for batch update operation
    /// </summary>
    public class BatchUpdateResponse
    {
        /// <summary>
        /// List of successfully updated flashcard IDs
        /// </summary>
        public List<Guid> UpdatedIds { get; set; } = new();

        /// <summary>
        /// Operation result message
        /// </summary>
        public required string Message { get; set; }
    }

    /// <summary>
    /// Request for generating flashcards using AI
    /// </summary>
    public class GenerateFlashcardsRequest
    {
        /// <summary>
        /// Source text to generate flashcards from
        /// </summary>
        [Required]
        public string SourceText { get; set; } = string.Empty;

        /// <summary>
        /// Number of flashcards to generate (3-20)
        /// </summary>
        [Range(3, 20)]
        public int NumberOfCards { get; set; } = 5;

        /// <summary>
        /// Optional custom API model name to use for generation
        /// </summary>
        public string? ApiModelName { get; set; } = null;

        /// <summary>
        /// Optional API model key for generation
        /// </summary>
        public string? ApiModelKey { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response for flashcard generation
    /// </summary>
    public class GenerateFlashcardsResponse
    {
        /// <summary>
        /// List of generated flashcards
        /// </summary>
        public List<CreateFlashcardDto> Flashcards { get; set; } = new();

        /// <summary>
        /// ID of the collection the flashcards were generated for
        /// </summary>
        public Guid CollectionId { get; set; }
    }

    /// <summary>
    /// Statistics about archived flashcards
    /// </summary>
    public class ArchivedStatisticsDto
    {
        /// <summary>
        /// Total number of archived flashcards
        /// </summary>
        public int TotalArchived { get; set; }
    }

    /// <summary>
    /// Result from AI generation of flashcards
    /// </summary>
    public class AIGenerationResult
    {
        /// <summary>
        /// List of generated flashcards
        /// </summary>
        public List<CreateFlashcardDto> Flashcards { get; set; } = new();
        
        /// <summary>
        /// Relevant topic tags for the content
        /// </summary>
        public List<string> Tags { get; set; } = new();
        
        /// <summary>
        /// Broad subject categories for the content
        /// </summary>
        public List<string> Categories { get; set; } = new();
    }
} 