using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Swashbuckle.AspNetCore.Annotations;

namespace TenXCards.Core.DTOs
{
    /// <summary>
    /// Response DTO for a collection
    /// </summary>
    public class CollectionResponseDto
    {
        /// <summary>
        /// Unique identifier of the collection
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Name of the collection
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Optional description of the collection
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Creation timestamp
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Last update timestamp
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Archive timestamp, if archived
        /// </summary>
        public DateTime? ArchivedAt { get; set; }

        /// <summary>
        /// Total number of flashcards in the collection
        /// </summary>
        public int TotalCards { get; set; }

        /// <summary>
        /// Number of cards due for review
        /// </summary>
        public int DueCards { get; set; }

        /// <summary>
        /// Color identifier for the collection
        /// </summary>
        public required string Color { get; set; }

        /// <summary>
        /// List of tags associated with the collection
        /// </summary>
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// List of categories associated with the collection
        /// </summary>
        public List<string> Categories { get; set; } = new();

        /// <summary>
        /// List of archived flashcards in the collection
        /// </summary>
        public List<FlashcardResponseDto> ArchivedFlashcards { get; set; } = new();

        /// <summary>
        /// List of active flashcards in the collection
        /// </summary>
        public List<FlashcardResponseDto> Flashcards { get; set; } = new();
    }

    /// <summary>
    /// DTO for creating a new collection
    /// </summary>
    [SwaggerSchema(Title = "Create Collection Request")]
    public class CreateCollectionDto
    {
        /// <summary>
        /// Name of the collection (required)
        /// </summary>
        /// <example>My Study Collection</example>
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Optional description of the collection
        /// </summary>
        /// <example>Collection for my study materials</example>
        public string? Description { get; set; }
        
        /// <summary>
        /// Color identifier for the collection (required)
        /// </summary>
        /// <example>#FF5733</example>
        [Required]
        public string Color { get; set; } = string.Empty;

        /// <summary>
        /// List of tags to associate with the collection (optional)
        /// </summary>
        /// <example>["study", "math", "science"]</example>
        [SwaggerSchema(Description = "Optional list of tags")]
        public List<string>? Tags { get; set; }

        /// <summary>
        /// List of categories to associate with the collection (optional)
        /// </summary>
        /// <example>["academic", "personal"]</example>
        [SwaggerSchema(Description = "Optional list of categories")]
        public List<string>? Categories { get; set; }

        // Internal property not exposed in Swagger
        [JsonIgnore]
        internal Guid? UserId { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing collection
    /// </summary>
    public class UpdateCollectionDto
    {
        /// <summary>
        /// Updated name of the collection (required)
        /// </summary>
        [Required]
        [MinLength(1)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Updated description of the collection
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Updated color identifier for the collection (required)
        /// </summary>
        [Required]
        public string Color { get; set; } = string.Empty;

        /// <summary>
        /// Updated list of tags
        /// </summary>
        public List<string>? Tags { get; set; }

        /// <summary>
        /// Updated list of categories
        /// </summary>
        public List<string>? Categories { get; set; }
    }

    /// <summary>
    /// Query parameters for collection listing
    /// </summary>
    public class CollectionsQueryParams
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
        /// Filter by archived status
        /// </summary>
        public bool? Archived { get; set; }
    }

    /// <summary>
    /// Response containing a paginated list of collections
    /// </summary>
    public class CollectionsResponse
    {
        /// <summary>
        /// List of collections
        /// </summary>
        public IEnumerable<CollectionResponseDto> Collections { get; set; } = new List<CollectionResponseDto>();

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
}
