using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services; 

namespace TenXCards.Core.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly IFlashcardRepository _repository;
        private readonly ICollectionService _collectionService;
        private readonly ICollectionRepository _collectionRepository;
        private readonly IAIService _aiService;
        public FlashcardService(
            IFlashcardRepository repository, 
            ICollectionService collectionService,
            ICollectionRepository collectionRepository,
            IAIService aiService)
        {
            _repository = repository;
            _collectionService = collectionService;
            _collectionRepository = collectionRepository;
            _aiService = aiService;
        }

        public async Task<FlashcardResponseDto?> GetByIdAsync(Guid id)
        {
            var flashcard = await _repository.GetByIdAsync(id);
            return flashcard != null ? MapToResponseDto(flashcard) : null;
        }

        public async Task<PaginatedResponse<FlashcardResponseDto>> GetAllAsync(FlashcardsQueryParams queryParams)
        {
            var (items, total) = await _repository.GetAllAsync(queryParams);
            
            return new PaginatedResponse<FlashcardResponseDto>
            {
                Items = MapToResponseDtos(items),
                Limit = queryParams.Limit,
                Offset = queryParams.Offset,
                TotalCount = total
            };
        }

        public async Task<PaginatedResponse<FlashcardResponseDto>> GetArchivedAsync(FlashcardsQueryParams queryParams)
        {
            queryParams.Archived = true;
            var (items, total) = await _repository.GetAllAsync(queryParams);
            
            return new PaginatedResponse<FlashcardResponseDto>
            {
                Items = MapToResponseDtos(items),
                Limit = queryParams.Limit,
                Offset = queryParams.Offset,
                TotalCount = total
            };
        }

        public async Task<FlashcardResponseDto> CreateAsync(CreateFlashcardDto createDto)
        {
            var flashcard = new Flashcard
            {
                Id = Guid.NewGuid(),
                Front = createDto.Front,
                Back = createDto.Back,
                CreationSource = createDto.CreationSource,
                ReviewStatus = createDto.ReviewStatus,
                Sm2Efactor = 2.5 // Default value for new cards
            };

            var created = await _repository.CreateAsync(flashcard);
            return MapToResponseDto(created);
        }

        public async Task<FlashcardResponseDto> CreateForCollectionAsync(Guid collectionId, CreateFlashcardDto createDto)
        {
            var collection = await _collectionRepository.GetByIdAsync(collectionId);
            if (collection == null)
                throw new Exception($"Collection with id {collectionId} not found");

            var flashcard = new Flashcard
            {
                Id = Guid.NewGuid(),
                Front = createDto.Front,
                Back = createDto.Back,
                CreationSource = createDto.CreationSource,
                ReviewStatus = createDto.ReviewStatus,
                Sm2Efactor = 2.5, // Default value for new cards
                CollectionId = collectionId,
                UserId = collection.UserId
            };
            var created = await _repository.CreateAsync(flashcard);
            return MapToResponseDto(created);
        }

        public async Task<FlashcardResponseDto?> UpdateAsync(Guid id, UpdateFlashcardDto updateDto)
        {
            var existingFlashcard = await _repository.GetByIdAsync(id);
            if (existingFlashcard == null)
                return null;

            if (updateDto.Front != null) existingFlashcard.Front = updateDto.Front;
            if (updateDto.Back != null) existingFlashcard.Back = updateDto.Back;
            if (updateDto.ReviewStatus.HasValue) existingFlashcard.ReviewStatus = updateDto.ReviewStatus.Value;
            if (updateDto.ArchivedAt.HasValue)
            {
                existingFlashcard.ArchivedAt = updateDto.ArchivedAt.Value;
            }

            var updated = await _repository.UpdateAsync(existingFlashcard);
            if (updated == null) return null;
            return MapToResponseDto(updated);
        }

        public async Task<BatchUpdateResponse> BatchUpdateAsync(BatchUpdateRequest request)
        {
            var updatedFlashcards = await _repository.UpdateManyAsync(request.FlashcardIds, flashcard =>
            {
                if (request.Update.Front != null) flashcard.Front = request.Update.Front;
                if (request.Update.Back != null) flashcard.Back = request.Update.Back;
                if (request.Update.ReviewStatus.HasValue) flashcard.ReviewStatus = request.Update.ReviewStatus.Value;
                if (request.Update.ArchivedAt.HasValue)
                {
                    flashcard.ArchivedAt = request.Update.ArchivedAt.Value;
                }
            });

            return new BatchUpdateResponse
            {
                UpdatedIds = updatedFlashcards.Select(f => f.Id).ToList(),
                Message = $"Successfully updated {updatedFlashcards.Count()} flashcards"
            };
        }

        public async Task<FlashcardResponseDto?> ArchiveAsync(Guid id)
        {
            var flashcard = await _repository.GetByIdAsync(id);
            if (flashcard == null)
                return null;
            flashcard.ArchivedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(flashcard);

            // Check if all flashcards in the collection are archived
            if (flashcard.CollectionId != Guid.Empty)
            {
                var allInCollection = await _repository.GetAllAsync(new FlashcardsQueryParams { CollectionId = flashcard.CollectionId, Offset = 0, Limit = int.MaxValue });
                if (allInCollection.Items.All(f => f.ArchivedAt != null))
                {
                    // Archive the collection if all flashcards are archived
                    await _collectionService.ArchiveAsync(flashcard.CollectionId);
                }
            }
            return MapToResponseDto(flashcard);
        }

        public async Task<FlashcardResponseDto?> UnarchiveAsync(Guid id)
        {
            var flashcard = await _repository.GetByIdAsync(id);
            if (flashcard == null)
                return null;
            flashcard.ArchivedAt = null;
            await _repository.UpdateAsync(flashcard);

            // Check if all flashcards in the collection are archived
            if (flashcard.CollectionId != Guid.Empty)
            {
                var allInCollection = await _repository.GetAllAsync(new FlashcardsQueryParams { CollectionId = flashcard.CollectionId, Offset = 0, Limit = int.MaxValue });
                if (!allInCollection.Items.All(f => f.ArchivedAt != null))
                {
                    // Unarchive the collection if not all flashcards are archived
                    await _collectionService.UnarchiveAsync(flashcard.CollectionId);
                }
            }
            return MapToResponseDto(flashcard);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<ArchivedStatisticsDto> GetArchivedStatisticsAsync()
        {
            var (archivedCards, _) = await _repository.GetAllAsync(new FlashcardsQueryParams { Archived = true, Offset = 0, Limit = 1 });

            return new ArchivedStatisticsDto
            {
                TotalArchived = archivedCards.Count()
            };
        }

        public async Task<GenerateFlashcardsResponse> GenerateFlashcardsAsync(Guid collectionId, GenerateFlashcardsRequest request)
        {
            // Generate flashcards using AI
            var generatedContent = await _aiService.GenerateFlashcardsAsync(
                request.SourceText,
                request.NumberOfCards,
                request.ApiModelKey
            );

            // If this is a new collection, update its metadata
            var collection = await _collectionRepository.GetByIdAsync(collectionId);
            if (collection != null)
            {
                collection.Tags.AddRange(generatedContent.Tags.Where(t => !collection.Tags.Contains(t)));
                collection.Categories.AddRange(generatedContent.Categories.Where(c => !collection.Categories.Contains(c)));
                await _collectionRepository.UpdateAsync(collection);
            }

            // Create all flashcards in the collection
            var createdFlashcards = new List<CreateFlashcardDto>();
            foreach (var flashcard in generatedContent.Flashcards)
            {
                var created = await CreateForCollectionAsync(collectionId, flashcard);
                if (created != null)
                {
                    createdFlashcards.Add(flashcard);
                }
            }

            return new GenerateFlashcardsResponse
            {
                Flashcards = createdFlashcards,
                CollectionId = collectionId
            };
        }

        private static FlashcardResponseDto MapToResponseDto(Flashcard flashcard)
        {
            return new FlashcardResponseDto
            {
                Id = flashcard.Id,
                UserId = flashcard.UserId,
                CollectionId = flashcard.CollectionId,
                Front = flashcard.Front,
                Back = flashcard.Back,
                CreatedAt = flashcard.CreatedAt,
                UpdatedAt = flashcard.UpdatedAt,
                ArchivedAt = flashcard.ArchivedAt,
                CreationSource = flashcard.CreationSource,
                ReviewStatus = flashcard.ReviewStatus,
                ReviewedAt = flashcard.ReviewedAt,
                Sm2Repetitions = flashcard.Sm2Repetitions,
                Sm2Interval = flashcard.Sm2Interval,
                Sm2Efactor = flashcard.Sm2Efactor,
                Sm2DueDate = flashcard.Sm2DueDate
            };
        }

        private static IEnumerable<FlashcardResponseDto> MapToResponseDtos(IEnumerable<Flashcard> flashcards)
        {
            return flashcards.Select(MapToResponseDto);
        }
    }
}