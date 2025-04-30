using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TenXCards.Core.Models;

namespace TenXCards.Core.DTOs
{
    public class CreateFlashcardDto
    {
        public required string Front { get; set; }
        public required string Back { get; set; }
        public FlashcardCreationSource CreationSource { get; set; } = FlashcardCreationSource.Manual;
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        public ReviewStatus ReviewStatus { get; set; } = ReviewStatus.Approved;
    }

    public class UpdateFlashcardDto
    {
        public string? Front { get; set; }
        public string? Back { get; set; }
        public List<string>? Tags { get; set; }
        public List<string>? Category { get; set; }
        public ReviewStatus? ReviewStatus { get; set; }
        public DateTime? ArchivedAt { get; set; }
    }

    public class FlashcardResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid CollectionId { get; set; }
        public required string Front { get; set; }
        public required string Back { get; set; }
        public ReviewStatus ReviewStatus { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public FlashcardCreationSource CreationSource { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public double Sm2Efactor { get; set; }
        public DateTime? Sm2DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
    }

    public class FlashcardsQueryParams
    {
        public int Offset { get; set; } = 0;

        [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
        public int Limit { get; set; } = 20;

        public ReviewStatus? ReviewStatus { get; set; }
        public string? SearchPhrase { get; set; }
        public string? Tag { get; set; }
        public string? Category { get; set; }
        public bool? Archived { get; set; }
        public Guid? CollectionId { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public required IEnumerable<T> Items { get; set; }
        public int Limit { get; set; }
        public int Offset { get; set; }
        public int TotalCount { get; set; }
    }

    public class BatchUpdateRequest
    {
        public required List<Guid> FlashcardIds { get; set; }
        public required UpdateFlashcardDto Update { get; set; }
    }

    public class BatchUpdateResponse
    {
        public List<Guid> UpdatedIds { get; set; } = new();
        public required string Message { get; set; }
    }

    public class GenerateFlashcardsRequest
    {
        [Required]
        public string SourceText { get; set; } = string.Empty;

        [Range(1, 50)]
        public int NumberOfCards { get; set; } = 10;

        public string? ApiModelKey { get; set; }
    }

    public class GenerateFlashcardsResponse
    {
        public List<CreateFlashcardDto> Flashcards { get; set; } = new();
        public Guid CollectionId { get; set; }
    }

    public class ArchivedStatisticsDto
    {
        public int TotalArchived { get; set; }
        public Dictionary<string, int> ArchivedByCategory { get; set; } = new();
    }
} 