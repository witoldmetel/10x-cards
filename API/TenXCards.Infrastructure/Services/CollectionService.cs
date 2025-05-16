using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Services;
using TenXCards.Core.Repositories;
using TenXCards.Infrastructure.Data;
using System.Collections.Generic;

namespace TenXCards.Infrastructure.Services;

public class CollectionService : ICollectionService
{
    private readonly ApplicationDbContext _context;
    private readonly ICollectionRepository _collectionRepository;
    private readonly IFlashcardRepository _flashcardRepository;

    public CollectionService(ApplicationDbContext context, ICollectionRepository collectionRepository, IFlashcardRepository flashcardRepository)
    {
        _context = context;
        _collectionRepository = collectionRepository;
        _flashcardRepository = flashcardRepository;
    }

    public async Task<CollectionsResponse> GetAllAsync(CollectionsQueryParams queryParams, Guid userId)
    {
        var result = await _collectionRepository.GetAllAsync(queryParams, userId);
        return new CollectionsResponse
        {
            Collections = result.Items.Select(MapToResponseDto),
            Limit = queryParams.Limit,
            Offset = queryParams.Offset,
            TotalCount = result.Total
        };
    }

    public async Task<CollectionsResponse> GetAllForDashboardAsync(Guid userId)
    {
        var collections = await _collectionRepository.GetAllForDashboardAsync(userId);
        return new CollectionsResponse
        {
            Collections = collections.Select(MapToResponseDto),
            Limit = 100,
            Offset = 0,
            TotalCount = collections.Count()
        };
    }

    public async Task<CollectionsResponse> GetAllArchivedAsync(Guid userId)
    {
        var collections = await _collectionRepository.GetAllArchivedAsync(userId);
        return new CollectionsResponse
        {
            Collections = collections.Select(MapToResponseDto),
            Limit = 100,
            Offset = 0,
            TotalCount = collections.Count()
        };
    }

    public async Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var collection = await _collectionRepository.GetByIdAsync(id, userId);
        return collection == null ? null : MapToResponseDto(collection);
    }

    public async Task<CollectionResponseDto> CreateAsync(CreateCollectionDto createDto, Guid userId)
    {
        var collection = new Collection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = createDto.Name,
            Description = createDto.Description ?? string.Empty,
            Color = createDto.Color,
            Tags = createDto.Tags ?? new List<string>(),
            Categories = createDto.Categories ?? new List<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _collectionRepository.CreateAsync(collection);
        return MapToResponseDto(created);
    }

    public async Task<CollectionResponseDto?> UpdateAsync(Guid id, UpdateCollectionDto updateDto, Guid userId)
    {
        var collection = await _collectionRepository.GetByIdAsync(id, userId);
        if (collection == null) return null;

        collection.Name = updateDto.Name;
        collection.Description = updateDto.Description ?? string.Empty;
        collection.Color = updateDto.Color;
        collection.Tags = updateDto.Tags ?? collection.Tags;
        collection.Categories = updateDto.Categories ?? collection.Categories;
        collection.UpdatedAt = DateTime.UtcNow;

        var updated = await _collectionRepository.UpdateAsync(collection);
        return updated == null ? null : MapToResponseDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        return await _collectionRepository.DeleteAsync(id, userId);
    }

    public async Task<bool> ArchiveAsync(Guid id, Guid userId)
    {
        return await _collectionRepository.ArchiveAsync(id, userId);
    }

    public async Task<bool> UnarchiveAsync(Guid id, Guid userId)
    {
        return await _collectionRepository.UnarchiveAsync(id, userId);
    }

    public async Task<GlobalStatisticsDto> GetGlobalStatisticsAsync(Guid userId)
    {
        var collections = await _collectionRepository.GetAllForDashboardAsync(userId);
        var allFlashcards = new List<Flashcard>();
        var now = DateTime.UtcNow;

        foreach (var collection in collections)
        {
            var flashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = collection.Id,
                UserId = userId,
                Offset = 0,
                Limit = int.MaxValue,
                IncludeArchived = true
            });
            allFlashcards.AddRange(flashcards.Items);
        }

        var activeFlashcards = allFlashcards.Where(f => f.ArchivedAt == null).ToList();
        var archivedFlashcards = allFlashcards.Where(f => f.ArchivedAt != null).ToList();
        var masteredFlashcards = activeFlashcards.Where(f => f.ReviewStatus != ReviewStatus.New).ToList();
        var dueFlashcards = activeFlashcards.Where(f => 
            f.ReviewStatus == ReviewStatus.New || 
            (f.Sm2DueDate.HasValue && f.Sm2DueDate.Value <= now)
        ).ToList();

        // Calculate mastery level
        var masteryLevel = collections.Any() 
            ? (int)Math.Round(collections.Average(c => c.MasteryLevel))
            : 0;

        // Find last studied date
        var lastStudied = collections
            .Where(c => c.LastStudied.HasValue)
            .Max(c => c.LastStudied);

        // Get best streak across all collections
        var bestStreak = collections.Max(c => c.BestStreak);

        // Get current streak as the maximum current streak across collections
        var currentStreak = collections.Max(c => c.CurrentStreak);

        return new GlobalStatisticsDto
        {
            MasteryLevel = masteryLevel,
            LastStudied = lastStudied,
            TotalCards = activeFlashcards.Count,
            MasteredCards = masteredFlashcards.Count,
            CurrentStreak = currentStreak,
            BestStreak = bestStreak,
            DueCards = dueFlashcards.Count,
            ArchivedCards = archivedFlashcards.Count
        };
    }

    private static CollectionResponseDto MapToResponseDto(Collection collection)
    {
        return new CollectionResponseDto
        {
            Id = collection.Id,
            UserId = collection.UserId,
            Name = collection.Name,
            Description = collection.Description,
            Color = collection.Color,
            Tags = collection.Tags,
            Categories = collection.Categories,
            TotalCards = collection.TotalCards,
            DueCards = collection.DueCards,
            LastStudied = collection.LastStudied,
            MasteryLevel = collection.MasteryLevel,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            ArchivedAt = collection.ArchivedAt,
            Flashcards = collection.Flashcards?.Where(f => f.ArchivedAt == null).Select(MapFlashcardToDto).ToList() ?? new List<FlashcardResponseDto>(),
            ArchivedFlashcards = collection.Flashcards?.Where(f => f.ArchivedAt != null).Select(MapFlashcardToDto).ToList() ?? new List<FlashcardResponseDto>()
        };
    }

    private static FlashcardResponseDto MapFlashcardToDto(Flashcard flashcard)
    {
        return new FlashcardResponseDto
        {
            Id = flashcard.Id,
            CollectionId = flashcard.CollectionId,
            Front = flashcard.Front,
            Back = flashcard.Back,
            ReviewStatus = flashcard.ReviewStatus,
            ReviewedAt = flashcard.ReviewedAt,
            CreatedAt = flashcard.CreatedAt,
            UpdatedAt = flashcard.UpdatedAt,
            ArchivedAt = flashcard.ArchivedAt,
            CreationSource = flashcard.CreationSource,
            Sm2Repetitions = flashcard.Sm2Repetitions,
            Sm2Interval = flashcard.Sm2Interval,
            Sm2Efactor = flashcard.Sm2Efactor,
            Sm2DueDate = flashcard.Sm2DueDate
        };
    }
} 