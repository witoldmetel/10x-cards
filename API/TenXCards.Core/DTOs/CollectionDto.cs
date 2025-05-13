using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Swashbuckle.AspNetCore.Annotations;

namespace TenXCards.Core.DTOs;

[SwaggerSchema(Title = "Collection Response")]
public record CollectionResponseDto
{
    [SwaggerSchema(Description = "Unique identifier of the collection")]
    public Guid Id { get; init; }

    [SwaggerSchema(Description = "Identifier of the user who owns the collection")]
    public Guid UserId { get; init; }

    [SwaggerSchema(Description = "Name of the collection")]
    public string Name { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Optional description of the collection")]
    public string? Description { get; init; }

    [SwaggerSchema(Description = "Creation timestamp")]
    public DateTime CreatedAt { get; init; }

    [SwaggerSchema(Description = "Last update timestamp")]
    public DateTime? UpdatedAt { get; init; }

    [SwaggerSchema(Description = "Archive timestamp, if archived")]
    public DateTime? ArchivedAt { get; init; }

    [SwaggerSchema(Description = "Total number of flashcards in the collection")]
    public int TotalCards { get; init; }

    [SwaggerSchema(Description = "Number of cards due for review")]
    public int DueCards { get; init; }

    [SwaggerSchema(Description = "Color identifier for the collection")]
    public string Color { get; init; } = string.Empty;

    [SwaggerSchema(Description = "List of tags associated with the collection")]
    public List<string> Tags { get; init; } = new();

    [SwaggerSchema(Description = "List of categories associated with the collection")]
    public List<string> Categories { get; init; } = new();

    [SwaggerSchema(Description = "List of archived flashcards in the collection")]
    public List<FlashcardResponseDto> ArchivedFlashcards { get; init; } = new();

    [SwaggerSchema(Description = "List of active flashcards in the collection")]
    public List<FlashcardResponseDto> Flashcards { get; init; } = new();
}

[SwaggerSchema(Title = "Create Collection Request")]
public record CreateCollectionDto
{
    [Required]
    [MinLength(1)]
    [SwaggerSchema(Description = "Name of the collection")]
    public string Name { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Optional description of the collection")]
    public string? Description { get; init; }

    [Required]
    [SwaggerSchema(Description = "Color identifier for the collection")]
    public string Color { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Optional list of tags")]
    public List<string>? Tags { get; init; }

    [SwaggerSchema(Description = "Optional list of categories")]
    public List<string>? Categories { get; init; }

    [JsonIgnore]
    internal Guid? UserId { get; init; }
}

[SwaggerSchema(Title = "Update Collection Request")]
public record UpdateCollectionDto
{
    [Required]
    [MinLength(1)]
    [SwaggerSchema(Description = "Updated name of the collection")]
    public string Name { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Updated description of the collection")]
    public string? Description { get; init; }

    [Required]
    [SwaggerSchema(Description = "Updated color identifier for the collection")]
    public string Color { get; init; } = string.Empty;

    [SwaggerSchema(Description = "Updated list of tags")]
    public List<string>? Tags { get; init; }

    [SwaggerSchema(Description = "Updated list of categories")]
    public List<string>? Categories { get; init; }
}

[SwaggerSchema(Title = "Collection Query Parameters")]
public record CollectionsQueryParams
{
    [SwaggerSchema(Description = "Number of items to skip")]
    public int Offset { get; init; }

    [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
    [SwaggerSchema(Description = "Maximum number of items to return (1-100)")]
    public int Limit { get; init; } = 20;

    [SwaggerSchema(Description = "Filter by archived status")]
    public bool? Archived { get; init; }
}

[SwaggerSchema(Title = "Paginated Collections Response")]
public record CollectionsResponse
{
    [SwaggerSchema(Description = "List of collections")]
    public IEnumerable<CollectionResponseDto> Collections { get; init; } = new List<CollectionResponseDto>();

    [SwaggerSchema(Description = "Maximum number of items returned")]
    public int Limit { get; init; }

    [SwaggerSchema(Description = "Number of items skipped")]
    public int Offset { get; init; }

    [SwaggerSchema(Description = "Total number of items available")]
    public int TotalCount { get; init; }
}
