using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;

namespace TenXCards.Core.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepository _collectionRepository;
        private readonly IFlashcardRepository _flashcardRepository;
        private const int DefaultLimit = 10;
        private const int MaxLimit = 100;

        public CollectionService(ICollectionRepository collectionRepository, IFlashcardRepository flashcardRepository)
        {
            _collectionRepository = collectionRepository;
            _flashcardRepository = flashcardRepository;
        }

        public async Task<CollectionsResponse> GetAllAsync(CollectionsQueryParams queryParams, Guid userId)
        {
            var (items, total) = await _collectionRepository.GetAllAsync(queryParams, userId);
            var collectionsWithFlashcards = new List<CollectionResponseDto>();

            foreach (var collection in items)
            {
                // Get all flashcards for this collection (both active and archived)
                var allFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
                { 
                    CollectionId = collection.Id,
                    UserId = userId,
                    Offset = 0,
                    Limit = MaxLimit,
                    IncludeArchived = true
                });

                // Split flashcards into active and archived
                var activeFlashcards = allFlashcards.Items.Where(f => f.ArchivedAt == null).ToList();
                var archivedFlashcards = allFlashcards.Items.Where(f => f.ArchivedAt != null).ToList();

                // Update collection's flashcards list to only include active ones
                collection.Flashcards = activeFlashcards;

                collectionsWithFlashcards.Add(MapToResponseDtoWithArchivedFlashcards(
                    collection, 
                    archivedFlashcards.Select(MapFlashcardToDto).ToList()
                ));
            }

            return new CollectionsResponse
            {
                Collections = collectionsWithFlashcards,
                Limit = queryParams.Limit,
                Offset = queryParams.Offset,
                TotalCount = total
            };
        }

        public async Task<CollectionsResponse> GetAllForDashboardAsync(Guid userId)
        {
            var collections = await _collectionRepository.GetAllForDashboardAsync(userId);
            return new CollectionsResponse
            {
                Collections = collections.Select(MapToResponseDto),
                Limit = DefaultLimit,
                Offset = 0,
                TotalCount = collections.Count()
            };
        }

        public async Task<CollectionsResponse> GetAllArchivedAsync(Guid userId)
        {
            var collections = await _collectionRepository.GetAllArchivedAsync(userId);
            var archivedFlashcardsMap = new Dictionary<Guid, List<FlashcardResponseDto>>();

            // First, get all archived flashcards for all collections
            foreach (var collection in collections)
            {
                var archivedFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
                { 
                    CollectionId = collection.Id,
                    Archived = true,
                    Offset = 0,
                    Limit = DefaultLimit 
                });
                archivedFlashcardsMap[collection.Id] = archivedFlashcards.Items.Select(MapFlashcardToDto).ToList();
            }

            // Then create the response with the archived flashcards
            return new CollectionsResponse
            {
                Collections = collections.Select(c => MapToResponseDtoWithArchivedFlashcards(c, archivedFlashcardsMap.GetValueOrDefault(c.Id, new List<FlashcardResponseDto>()))),
                Limit = DefaultLimit,
                Offset = 0,
                TotalCount = collections.Count()
            };
        }

        public async Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var collection = await _collectionRepository.GetByIdAsync(id, userId);
            if (collection == null) return null;

            // Get all flashcards for this collection (both active and archived)
            var allFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = id,
                UserId = userId,
                Offset = 0,
                Limit = MaxLimit,
                IncludeArchived = true
            });

            // Split flashcards into active and archived
            var activeFlashcards = allFlashcards.Items.Where(f => f.ArchivedAt == null).ToList();
            var archivedFlashcards = allFlashcards.Items.Where(f => f.ArchivedAt != null).ToList();

            // Update collection's flashcards list to only include active ones
            collection.Flashcards = activeFlashcards;

            return MapToResponseDtoWithArchivedFlashcards(collection, archivedFlashcards.Select(MapFlashcardToDto).ToList());
        }

        public async Task<CollectionResponseDto?> UpdateAsync(Guid id, UpdateCollectionDto updateDto, Guid userId)
        {
            var collection = await _collectionRepository.GetByIdAsync(id, userId);
            if (collection == null) return null;

            collection.Name = updateDto.Name;
            collection.Description = updateDto.Description;
            collection.Color = updateDto.Color;
            if (updateDto.Tags != null) collection.Tags = updateDto.Tags;
            if (updateDto.Categories != null) collection.Categories = updateDto.Categories;
            collection.UpdatedAt = DateTime.UtcNow;

            var updated = await _collectionRepository.UpdateAsync(collection);
            if (updated == null) return null;
            return MapToResponseDto(updated);
        }

        public async Task<CollectionResponseDto> CreateAsync(CreateCollectionDto createDto, Guid userId)
        {
            ValidateUserId(userId);

            var collection = new Collection
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                Tags = createDto.Tags ?? new List<string>(),
                Categories = createDto.Categories ?? new List<string>()
            };

            var created = await _collectionRepository.CreateAsync(collection);
            return MapToResponseDto(created);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            // Get all active flashcards
            var activeFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = id, 
                Offset = 0, 
                Limit = MaxLimit
            });

            // Get all archived flashcards
            var archivedFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = id, 
                Archived = true,
                Offset = 0, 
                Limit = MaxLimit
            });

            // Delete all flashcards
            var allFlashcards = activeFlashcards.Items.Union(archivedFlashcards.Items);
            foreach (var card in allFlashcards)
            {
                await _flashcardRepository.DeleteAsync(card.Id);
            }

            // Delete the collection
            return await _collectionRepository.DeleteAsync(id, userId);
        }

        public async Task<bool> ArchiveAsync(Guid id, Guid userId)
        {
            var archived = await _collectionRepository.ArchiveAsync(id, userId);
            if (!archived) return false;

            // Update collection statistics after archiving
            await _collectionRepository.UpdateCollectionStatistics(id);
            return true;
        }

        public async Task<bool> UnarchiveAsync(Guid id, Guid userId)
        {
            var unarchive = await _collectionRepository.UnarchiveAsync(id, userId);
            if (!unarchive) return false;

            // Cascade: unarchive all flashcards in this collection
            var flashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams { CollectionId = id, Archived = true, Offset = 0, Limit = MaxLimit });
            foreach (var card in flashcards.Items)
            {
                card.ArchivedAt = null;
                await _flashcardRepository.UpdateAsync(card);
            }
            return true;
        }

        private static CollectionResponseDto MapToResponseDto(Collection collection)
        {
            return MapToResponseDtoWithArchivedFlashcards(collection, new List<FlashcardResponseDto>());
        }

        private static CollectionResponseDto MapToResponseDtoWithArchivedFlashcards(Collection collection, List<FlashcardResponseDto> archivedFlashcards)
        {
            return new CollectionResponseDto
            {
                Id = collection.Id,
                UserId = collection.UserId,
                Name = collection.Name,
                Description = collection.Description,
                CreatedAt = collection.CreatedAt,
                UpdatedAt = collection.UpdatedAt,
                ArchivedAt = collection.ArchivedAt,
                TotalCards = collection.TotalCards,
                DueCards = collection.DueCards,
                LastStudied = collection.LastStudied,
                MasteryLevel = collection.MasteryLevel,
                Color = collection.Color,
                Tags = collection.Tags,
                Categories = collection.Categories,
                Flashcards = collection.Flashcards.Select(MapFlashcardToDto).ToList(),
                ArchivedFlashcards = archivedFlashcards
            };
        }

        private static FlashcardResponseDto MapFlashcardToDto(Flashcard flashcard)
        {
            return new FlashcardResponseDto
            {
                Id = flashcard.Id,
                UserId = flashcard.UserId,
                CollectionId = flashcard.CollectionId,
                Front = flashcard.Front,
                Back = flashcard.Back,
                ReviewStatus = flashcard.ReviewStatus,
                CreatedAt = flashcard.CreatedAt,
                UpdatedAt = flashcard.UpdatedAt,
                ArchivedAt = flashcard.ArchivedAt,
                ReviewedAt = flashcard.ReviewedAt,
                CreationSource = flashcard.CreationSource,
                Sm2Repetitions = flashcard.Sm2Repetitions,
                Sm2Interval = flashcard.Sm2Interval,
                Sm2Efactor = flashcard.Sm2Efactor,
                Sm2DueDate = flashcard.Sm2DueDate
            };
        }

        private void ValidateUserId(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                throw new ArgumentException("User ID cannot be found", nameof(userId));
            }
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
    }
}