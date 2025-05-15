using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Threading;
using System.Text.Json.Serialization;
using System.Net.Http.Headers;
using TenXCards.Core.Exceptions;
using System.Text.Json.Nodes;

namespace TenXCards.Core.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly ILogger<FlashcardService> _logger;
        private readonly IOpenRouterService _openRouterService;
        private readonly OpenRouterOptions _options;
        private readonly IFlashcardRepository _repository;
        private readonly ICollectionService _collectionService;
        private readonly ICollectionRepository _collectionRepository;
        private readonly IUserContextService _userContextService;

        public FlashcardService(
            ILogger<FlashcardService> logger,
            IOpenRouterService openRouterService,
            IOptions<OpenRouterOptions> options,
            IFlashcardRepository repository, 
            ICollectionService collectionService,
            ICollectionRepository collectionRepository,
            IUserContextService userContextService)
        {
            _logger = logger;
            _openRouterService = openRouterService;
            _options = options.Value;
            _repository = repository;
            _collectionService = collectionService;
            _collectionRepository = collectionRepository;
            _userContextService = userContextService;
        }

        public async Task<FlashcardResponseDto?> GetByIdAsync(Guid id)
        {
            var flashcard = await _repository.GetByIdAsync(id);
            return flashcard != null ? MapToResponseDto(flashcard) : null;
        }

        public async Task<PaginatedResponse<FlashcardResponseDto>> GetAllAsync(FlashcardsQueryParams queryParams)
        {
            queryParams = queryParams with { UserId = _userContextService.GetUserId() };
            var (items, total) = await _repository.GetAllAsync(queryParams);
            
            return new PaginatedResponse<FlashcardResponseDto>
            {
                Items = items.Select(MapToResponseDto),
                Limit = queryParams.Limit,
                Offset = queryParams.Offset,
                TotalCount = total
            };
        }

        public async Task<PaginatedResponse<FlashcardResponseDto>> GetArchivedAsync(FlashcardsQueryParams queryParams)
        {
            queryParams = queryParams with { 
                UserId = _userContextService.GetUserId(),
                Archived = true 
            };
            
            var (items, total) = await _repository.GetAllAsync(queryParams);
            
            return new PaginatedResponse<FlashcardResponseDto>
            {
                Items = items.Select(MapToResponseDto),
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
            var userId = _userContextService.GetUserId();
            var collection = await _collectionRepository.GetByIdAsync(collectionId, userId);
            
            if (collection == null)
            {
                throw new Exception($"Collection with id {collectionId} not found");
            }

            var flashcard = new Flashcard
            {
                Id = Guid.NewGuid(),
                Front = createDto.Front,
                Back = createDto.Back,
                CreationSource = createDto.CreationSource,
                ReviewStatus = createDto.ReviewStatus,
                Sm2Efactor = 2.5, // Default value for new cards
                CollectionId = collectionId,
                UserId = userId
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

            // Set archive timestamp
            flashcard.ArchivedAt = DateTime.UtcNow;
            var updatedFlashcard = await _repository.UpdateAsync(flashcard);

            // Get the collection and update its statistics
            if (flashcard.CollectionId != Guid.Empty)
            {
                var collection = await _collectionRepository.GetByIdAsync(flashcard.CollectionId, flashcard.UserId);
                if (collection != null)
                {
                    // Check if all flashcards in the collection are archived
                    var allInCollection = await _repository.GetAllAsync(new FlashcardsQueryParams 
                    { 
                        CollectionId = flashcard.CollectionId, 
                        Offset = 0, 
                        Limit = int.MaxValue 
                    });

                    if (allInCollection.Items.All(f => f.ArchivedAt != null))
                    {
                        // Archive the collection if all flashcards are archived
                        await _collectionService.ArchiveAsync(flashcard.CollectionId, flashcard.UserId);
                    }
                }
            }

            return MapToResponseDto(updatedFlashcard);
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
                    await _collectionService.UnarchiveAsync(flashcard.CollectionId, flashcard.UserId);
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

        public async Task<List<FlashcardResponseDto>> GenerateFlashcardsAsync(
            FlashcardGenerationRequestDto request, 
            Guid collectionId, 
            CancellationToken cancellationToken = default)
        {
            var userId = _userContextService.GetUserId();
            var collection = await _collectionRepository.GetByIdAsync(collectionId, userId);
            
            if (collection == null)
                throw new Exception($"Collection with id {collectionId} not found");

            var sourceTextHash = ComputeHash(request.SourceText);
            var existingFlashcard = await _repository.GetFlashcardBySourceHash(sourceTextHash, collectionId);
            
            if (existingFlashcard != null)
            {
                return new List<FlashcardResponseDto> { MapToResponseDto(existingFlashcard) };
            }

            try
            {
                var systemMessage = $"You are an expert flashcard creator and educator. Your task is to create {request.Count} effective flashcards that follow spaced repetition principles. Based on the provided text, generate concise, clear flashcards that test key concepts. Each flashcard should have a focused question on the front and a precise answer on the back. Return a JSON object with a 'flashcards' field containing an array of {request.Count} objects, where each object has 'front' and 'back' fields. Example format: {{\"flashcards\": [{{\"front\": \"Question\", \"back\": \"Answer\"}}]}}";
                
                var content = await _openRouterService.GetChatResponseAsync(
                    request.SourceText,
                    systemMessage,
                    request.Model ?? _options.DefaultModel,
                    new Dictionary<string, object>
                    {
                        { "temperature", 0.7 },
                        { "max_tokens", 4000 }
                    },
                    new ResponseFormat { Type = "json_object" },
                    cancellationToken);

                if (string.IsNullOrEmpty(content))
                {
                    throw new Exception("Empty response from OpenRouter API");
                }

                var jsonOptions = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    AllowTrailingCommas = true
                };

                try 
                {
                    var parsedResponse = JsonSerializer.Deserialize<FlashcardsResponse>(content, jsonOptions);

                    if (parsedResponse?.Flashcards == null || !parsedResponse.Flashcards.Any())
                    {
                        throw new Exception("Failed to parse flashcards from API response");
                    }

                    var createdFlashcards = new List<Flashcard>();
                    foreach (var flashcardDto in parsedResponse.Flashcards)
                    {                        
                        var flashcard = new Flashcard
                        {
                            Id = Guid.NewGuid(),
                            Front = flashcardDto.Front,
                            Back = flashcardDto.Back,
                            CreationSource = FlashcardCreationSource.AI,
                            ReviewStatus = ReviewStatus.New,
                            CollectionId = collectionId,
                            UserId = userId,
                            SourceTextHash = sourceTextHash,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            Sm2Efactor = 2.5
                        };

                        var created = await _repository.CreateAsync(flashcard);
                        createdFlashcards.Add(created);
                    }

                    return createdFlashcards.Select(MapToResponseDto).ToList();
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse flashcards from response. Content: {Content}", content);
                    throw new Exception("Failed to parse flashcards from API response", ex);
                }
            }
            catch (OpenRouterException ex)
            {
                _logger.LogError(ex, "OpenRouter API error for collection {CollectionId}. Error: {Error}", collectionId, ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcard for collection {CollectionId}. Error: {Error}", collectionId, ex.Message);
                throw;
            }
        }

        private static string ComputeHash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }

    // Helper classes for deserializing OpenRouter responses
    file class OpenRouterResponse
    {
        public List<OpenRouterChoice>? Choices { get; set; }
    }

    file class OpenRouterChoice
    {
        public OpenRouterMessage? Message { get; set; }
    }

    file class OpenRouterMessage
    {
        public string? Content { get; set; }
    }

    internal class FlashcardsResponse
    {
        [JsonPropertyName("flashcards")]
        public List<AIGeneratedFlashcard> Flashcards { get; set; } = new();
    }

    internal class AIGeneratedFlashcard
    {
        [JsonPropertyName("front")]
        public string Front { get; set; } = string.Empty;

        [JsonPropertyName("back")]
        public string Back { get; set; } = string.Empty;
    }
}