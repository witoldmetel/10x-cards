using System;
using System.Collections.Generic;
using System.Linq;
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

namespace TenXCards.Core.Services
{
    public class FlashcardService : IFlashcardService
    {
        private readonly ILogger<FlashcardService> _logger;
        private readonly HttpClient _httpClient;
        private readonly OpenRouterOptions _options;
        private readonly IFlashcardRepository _repository;
        private readonly ICollectionService _collectionService;
        private readonly ICollectionRepository _collectionRepository;
        public FlashcardService(
            ILogger<FlashcardService> logger,
            HttpClient httpClient,
            IOptions<OpenRouterOptions> options,
            IFlashcardRepository repository, 
            ICollectionService collectionService,
            ICollectionRepository collectionRepository)
        {
            _logger = logger;
            _httpClient = httpClient;
            _options = options.Value;
            _repository = repository;
            _collectionService = collectionService;
            _collectionRepository = collectionRepository;

            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_options.ApiKey}");
            _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
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
    
    public async Task<FlashcardGenerationResponseDto> GenerateFlashcardsAsync(FlashcardGenerationRequestDto request, Guid collectionId, CancellationToken cancellationToken = default)
    {
                var collection = await _collectionRepository.GetByIdAsync(collectionId);
            if (collection == null)
                throw new Exception($"Collection with id {collectionId} not found");


        try
        {
            var response = await _httpClient.PostAsJsonAsync(GenerationEndpoint, request, cancellationToken);
            response.EnsureSuccessStatusCode();
            
            var generation = new Generation
            {
                Model = request.Model ?? "default",
                SourceTextHash = ComputeHash(request.SourceText),   
                GeneratedCount = request.Count,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CollectionId = collectionId,
                UserId = collection.UserId
            };
            
            // await _dbContext.Generations.AddAsync(generation, cancellationToken);
            // await _dbContext.SaveChangesAsync(cancellationToken);
            
            var openRouterResponse = await response.Content.ReadFromJsonAsync<OpenRouterResponse>(cancellationToken: cancellationToken);
            var content = openRouterResponse?.Choices?.FirstOrDefault()?.Message?.Content;
            
            if (string.IsNullOrEmpty(content))
            {
                throw new Exception("Empty response from OpenRouter API");
            }
            
            // Sanitize the JSON response
            content = SanitizeJsonResponse(content);
            
            var jsonOptions = new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true 
            };
            
            var flashcards = JsonSerializer.Deserialize<List<GenerationFlashcardDto>>(content, jsonOptions);
            if (flashcards == null || !flashcards.Any())
            {
                throw new Exception("Failed to parse flashcards from API response");
            }
            
            generation.GeneratedCount = flashcards.Count;
            // await _dbContext.SaveChangesAsync(cancellationToken);
            
            return new GenerationResponseDto
            {
                Id = generation.Id,
                UserId = collection.UserId,
                Model = generation.Model,
                GeneratedCount = generation.GeneratedCount,
                Flashcards = flashcards,
                CreatedAt = generation.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating flashcards for user {UserId}", userId);
            
            await _dbContext.GenerationErrorLogs.AddAsync(new GenerationErrorLog
            {
                UserId = userId,
                ErrorCode = ex.GetType().Name,
                ErrorMessage = ex.Message,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
            
            // await _dbContext.SaveChangesAsync(cancellationToken);
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

    private static string SanitizeJsonResponse(string content)
    {
        content = content.Trim();
        
        // Remove markdown headers
        if (content.StartsWith("```json") || content.StartsWith("```"))
        {
            var startIndex = content.IndexOf('[');
            var endIndex = content.LastIndexOf(']');
            
            if (startIndex >= 0 && endIndex > startIndex)
            {
            content = content.Substring(startIndex, endIndex - startIndex + 1);
            }
        }
        
        // Check if we already have a JSON array
        if (!content.StartsWith("[") || !content.EndsWith("]"))
        {
            // Find the start of the array
            var startIndex = content.IndexOf('[');
            
            if (startIndex >= 0)
            {
            // Cut text from array start
            content = content.Substring(startIndex);
            
            // Check if array is properly terminated
            var endIndex = content.LastIndexOf(']');
            
            if (endIndex > 0)
            {
                // We have start and end of array
                content = content.Substring(0, endIndex + 1);
            }
            else
            {
                // No closing bracket - we need to add it
                // But first check if it ends with comma
                content = content.TrimEnd();
                if (content.EndsWith(","))
                {
                content = content.Substring(0, content.Length - 1);
                }
                // Add closing bracket
                content += "]";
            }
            }
        }
        
        return content;
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