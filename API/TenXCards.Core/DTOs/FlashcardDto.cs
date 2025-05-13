using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TenXCards.Core.Models;
using Swashbuckle.AspNetCore.Annotations;

namespace TenXCards.Core.DTOs;

[SwaggerSchema(Title = "Create Flashcard Request")]
public record CreateFlashcardDto
{
    [Required]
    [MinLength(1)]
    [SwaggerSchema(Description = "Front side content of the flashcard")]
    public string Front { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    [SwaggerSchema(Description = "Back side content of the flashcard")]
    public string Back { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Source of flashcard creation (Manual or AI-generated)")]
    public FlashcardCreationSource CreationSource { get; init; } = FlashcardCreationSource.Manual;

    [SwaggerSchema(Description = "Initial review status of the flashcard")]
    public ReviewStatus ReviewStatus { get; init; } = ReviewStatus.Approved;
}

[SwaggerSchema(Title = "Update Flashcard Request")]
public record UpdateFlashcardDto
{
    [MinLength(1)]
    [SwaggerSchema(Description = "Updated front side content")]
    public string? Front { get; init; }

    [MinLength(1)]
    [SwaggerSchema(Description = "Updated back side content")]
    public string? Back { get; init; }

    [SwaggerSchema(Description = "Updated review status")]
    public ReviewStatus? ReviewStatus { get; init; }

    [SwaggerSchema(Description = "Archive timestamp")]
    public DateTime? ArchivedAt { get; init; }
}

[SwaggerSchema(Title = "Flashcard Response")]
public record FlashcardResponseDto
{
    [SwaggerSchema(Description = "Unique identifier of the flashcard")]
    public Guid Id { get; init; }

    [SwaggerSchema(Description = "ID of the user who owns the flashcard")]
    public Guid UserId { get; init; }

    [SwaggerSchema(Description = "ID of the collection this flashcard belongs to")]
    public Guid CollectionId { get; init; }

    [Required]
    [SwaggerSchema(Description = "Front side content of the flashcard")]
    public string Front { get; init; } = string.Empty;

    [Required]
    [SwaggerSchema(Description = "Back side content of the flashcard")]
    public string Back { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Current review status of the flashcard")]
    public ReviewStatus ReviewStatus { get; init; }

    [SwaggerSchema(Description = "Last review timestamp")]
    public DateTime? ReviewedAt { get; init; }

    [SwaggerSchema(Description = "Source of flashcard creation")]
    public FlashcardCreationSource CreationSource { get; init; }

    [SwaggerSchema(Description = "SuperMemo2 algorithm: number of repetitions")]
    public int Sm2Repetitions { get; init; }

    [SwaggerSchema(Description = "SuperMemo2 algorithm: interval in days")]
    public int Sm2Interval { get; init; }

    [SwaggerSchema(Description = "SuperMemo2 algorithm: easiness factor")]
    public double Sm2Efactor { get; init; }

    [SwaggerSchema(Description = "Next review date based on SuperMemo2 algorithm")]
    public DateTime? Sm2DueDate { get; init; }

    [SwaggerSchema(Description = "Creation timestamp")]
    public DateTime CreatedAt { get; init; }

    [SwaggerSchema(Description = "Last update timestamp")]
    public DateTime? UpdatedAt { get; init; }

    [SwaggerSchema(Description = "Archive timestamp")]
    public DateTime? ArchivedAt { get; init; }
}

[SwaggerSchema(Title = "Flashcard Query Parameters")]
public record FlashcardsQueryParams
{
    [SwaggerSchema(Description = "Number of items to skip")]
    public int Offset { get; init; }

    [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
    [SwaggerSchema(Description = "Maximum number of items to return (1-100)")]
    public int Limit { get; init; } = 20;

    [SwaggerSchema(Description = "Filter by review status")]
    public ReviewStatus? ReviewStatus { get; init; }

    [SwaggerSchema(Description = "Search phrase to filter flashcards")]
    public string? SearchPhrase { get; init; }

    [SwaggerSchema(Description = "Filter by archived status")]
    public bool? Archived { get; init; }

    [SwaggerSchema(Description = "Filter by collection ID")]
    public Guid? CollectionId { get; init; }

    [SwaggerSchema(Description = "Filter by user ID")]
    public Guid UserId { get; init; }
}

[SwaggerSchema(Title = "Paginated Response")]
public record PaginatedResponse<T>
{
    [Required]
    [SwaggerSchema(Description = "List of items")]
    public IEnumerable<T> Items { get; init; } = new List<T>();

    [SwaggerSchema(Description = "Maximum number of items returned")]
    public int Limit { get; init; }

    [SwaggerSchema(Description = "Number of items skipped")]
    public int Offset { get; init; }

    [SwaggerSchema(Description = "Total number of items available")]
    public int TotalCount { get; init; }
}

[SwaggerSchema(Title = "Batch Update Request")]
public record BatchUpdateRequest
{
    [Required]
    [SwaggerSchema(Description = "List of flashcard IDs to update")]
    public IEnumerable<Guid> FlashcardIds { get; init; } = new List<Guid>();

    [Required]
    [SwaggerSchema(Description = "Update to apply to all selected flashcards")]
    public UpdateFlashcardDto Update { get; init; } = null!;
}

[SwaggerSchema(Title = "Batch Update Response")]
public record BatchUpdateResponse
{
    [Required]
    [SwaggerSchema(Description = "List of successfully updated flashcard IDs")]
    public IEnumerable<Guid> UpdatedIds { get; init; } = new List<Guid>();

    [Required]
    [SwaggerSchema(Description = "Operation result message")]
    public string Message { get; init; } = string.Empty;
}

[SwaggerSchema(Title = "Archived Statistics")]
public record ArchivedStatisticsDto
{
    [SwaggerSchema(Description = "Total number of archived flashcards")]
    public int TotalArchived { get; init; }
}

[SwaggerSchema(Title = "Flashcard Generation Request")]
public record FlashcardGenerationRequestDto
{
    [Required]
    [MinLength(10)]
    [MaxLength(4000)]
    [SwaggerSchema(Description = "The text from which flashcards should be generated")]
    public string SourceText { get; init; } = string.Empty;

    [Range(3, 20)]
    [SwaggerSchema(Description = "The number of flashcards to generate (3-20)")]
    public int Count { get; init; } = 3;

    [SwaggerSchema(Description = "Optional model to use for generation")]
    public string? Model { get; init; }
} 