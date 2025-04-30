using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TenXCards.Core.DTOs
{
    public class CollectionResponseDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ArchivedAt { get; set; }
        public int TotalCards { get; set; }
        public int DueCards { get; set; }
        public required string Color { get; set; }
        public List<FlashcardResponseDto> ArchivedFlashcards { get; set; } = new();
        public List<FlashcardResponseDto> Flashcards { get; set; } = new();
    }

    public class CreateCollectionDto
    {
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Color { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }
    }

    public class UpdateCollectionDto
    {
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Color { get; set; } = string.Empty;
    }

    public class CollectionsQueryParams
    {
        public int Offset { get; set; } = 0;

        [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
        public int Limit { get; set; } = 20;

        public bool? Archived { get; set; }
    }

    public class CollectionsResponse
    {
        public IEnumerable<CollectionResponseDto> Collections { get; set; } = new List<CollectionResponseDto>();
        public int Limit { get; set; }
        public int Offset { get; set; }
        public int TotalCount { get; set; }
    }
}
