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

        public CollectionService(ICollectionRepository collectionRepository, IFlashcardRepository flashcardRepository)
        {
            _collectionRepository = collectionRepository;
            _flashcardRepository = flashcardRepository;
        }

        public async Task<CollectionsResponse> GetAllAsync(CollectionsQueryParams queryParams)
        {
            var (items, total) = await _collectionRepository.GetAllAsync(queryParams);
            
            return new CollectionsResponse
            {
                Collections = items.Select(MapToResponseDto),
                Limit = queryParams.Limit,
                Offset = queryParams.Offset,
                TotalCount = total
            };
        }

        public async Task<CollectionsResponse> GetAllForDashboardAsync()
        {
            var collections = await _collectionRepository.GetAllForDashboardAsync();
            return new CollectionsResponse
            {
                Collections = collections.Select(MapToResponseDto),
                Limit = 0,
                Offset = 0,
                TotalCount = collections.Count()
            };
        }

        public async Task<CollectionsResponse> GetAllArchivedAsync()
        {
            var collections = await _collectionRepository.GetAllArchivedAsync();
            var response = new CollectionsResponse
            {
                Collections = collections.Select(MapToResponseDto),
                Limit = 0,
                Offset = 0,
                TotalCount = collections.Count()
            };

            foreach (var collection in response.Collections)
            {
                var archivedFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
                { 
                    CollectionId = collection.Id,
                    Archived = true,
                    Offset = 0,
                    Limit = int.MaxValue 
                });
                collection.ArchivedFlashcards = archivedFlashcards.Items.Select(MapFlashcardToDto).ToList();
            }

            return response;
        }

        public async Task<CollectionResponseDto?> GetByIdAsync(Guid id)
        {
            var collection = await _collectionRepository.GetByIdAsync(id);
            if (collection == null) return null;

            var dto = MapToResponseDto(collection);

            var archivedFlashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams 
            { 
                CollectionId = id,
                Archived = true,
                Offset = 0,
                Limit = int.MaxValue 
            });
            dto.ArchivedFlashcards = archivedFlashcards.Items.Select(MapFlashcardToDto).ToList();

            return dto;
        }

        public async Task<CollectionResponseDto?> UpdateAsync(Guid id, UpdateCollectionDto updateDto)
        {
            var collection = await _collectionRepository.GetByIdAsync(id);
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
            var collection = new Collection
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                UserId = userId,
                Tags = createDto.Tags ?? new List<string>(),
                Categories = createDto.Categories ?? new List<string>()
            };
            var created = await _collectionRepository.CreateAsync(collection);
            return MapToResponseDto(created);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _collectionRepository.DeleteAsync(id);
        }

        public async Task<bool> ArchiveAsync(Guid id)
        {
            var archived = await _collectionRepository.ArchiveAsync(id);
            if (!archived) return false;
            // Cascade: archive all flashcards in this collection
            var flashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams { CollectionId = id, Offset = 0, Limit = int.MaxValue });
            foreach (var card in flashcards.Items)
            {
                card.ArchivedAt = DateTime.UtcNow;
                await _flashcardRepository.UpdateAsync(card);
            }
            return true;
        }

        public async Task<bool> UnarchiveAsync(Guid id)
        {
            var unarchive = await _collectionRepository.UnarchiveAsync(id);
            if (!unarchive) return false;
            // Cascade: unarchive all flashcards in this collection
            var flashcards = await _flashcardRepository.GetAllAsync(new FlashcardsQueryParams { CollectionId = id, Archived = true, Offset = 0, Limit = int.MaxValue });
            foreach (var card in flashcards.Items)
            {
                card.ArchivedAt = null;
                await _flashcardRepository.UpdateAsync(card);
            }
            return true;
        }

        private static CollectionResponseDto MapToResponseDto(Collection collection)
        {
            return new CollectionResponseDto
            {
                Id = collection.Id,
                Name = collection.Name,
                Description = collection.Description,
                CreatedAt = collection.CreatedAt,
                UpdatedAt = collection.UpdatedAt,
                ArchivedAt = collection.ArchivedAt,
                TotalCards = collection.TotalCards,
                DueCards = collection.DueCards,
                Color = collection.Color,
                Tags = collection.Tags,
                Categories = collection.Categories,
                Flashcards = collection.Flashcards
                    .Where(f => f.ArchivedAt == null)
                    .Select(MapFlashcardToDto)
                    .ToList(),
                ArchivedFlashcards = new List<FlashcardResponseDto>()
            };
        }

        private static FlashcardResponseDto MapFlashcardToDto(Flashcard f)
        {
            return new FlashcardResponseDto
            {
                Id = f.Id,
                UserId = f.UserId,
                CollectionId = f.CollectionId,
                Front = f.Front,
                Back = f.Back,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                ArchivedAt = f.ArchivedAt,
                CreationSource = f.CreationSource,
                ReviewStatus = f.ReviewStatus,
                ReviewedAt = f.ReviewedAt,
                Sm2Repetitions = f.Sm2Repetitions,
                Sm2Interval = f.Sm2Interval,
                Sm2Efactor = f.Sm2Efactor,
                Sm2DueDate = f.Sm2DueDate
            };
        }
    }
}
