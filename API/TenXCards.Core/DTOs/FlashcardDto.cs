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
        public ReviewStatus ReviewStatus { get; set; } = ReviewStatus.New;
    }

    public class UpdateFlashcardDto
    {
        public required string Front { get; set; }
        public required string Back { get; set; }
        public bool? IsArchived { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        public ReviewStatus? ReviewStatus { get; set; }
    }

    public class FlashcardResponseDto
    {
        public Guid Id { get; set; }
        public required string Front { get; set; }
        public required string Back { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsArchived { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public FlashcardCreationSource CreationSource { get; set; }
        public ReviewStatus ReviewStatus { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Category { get; set; } = new();
        public int Sm2Repetitions { get; set; }
        public int Sm2Interval { get; set; }
        public double Sm2Efactor { get; set; }
        public DateTime? Sm2DueDate { get; set; }
    }

    public class FlashcardsQueryParams
    {
        [Range(1, int.MaxValue, ErrorMessage = "Page must be greater than 0")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
        public int Limit { get; set; } = 20;

        public ReviewStatus? ReviewStatus { get; set; }
        public string? SearchPhrase { get; set; }
        public string? Tag { get; set; }
        public string? Category { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public required IEnumerable<T> Items { get; set; }
        public required PaginationMetadata Pagination { get; set; }
    }

    public class PaginationMetadata
    {
        public int Page { get; set; }
        public int Limit { get; set; }
        public int Total { get; set; }
    }

    public class BatchUpdateRequest
    {
        public required List<Guid> FlashcardIds { get; set; }
        public UpdateFlashcardDto Update { get; set; }
    }

    public class BatchUpdateResponse
    {
        public List<Guid> UpdatedIds { get; set; }
        public string Message { get; set; }
    }

    public class ArchivedStatisticsDto
    {
        public int TotalArchived { get; set; }
        public Dictionary<string, int> ArchivedByCategory { get; set; }
    }
} 