using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using System.Threading;

namespace TenXCards.Core.Services
{
    public interface IFlashcardService
    {
        Task<FlashcardResponseDto?> GetByIdAsync(Guid id);
        Task<PaginatedResponse<FlashcardResponseDto>> GetAllAsync(FlashcardsQueryParams queryParams);
        Task<PaginatedResponse<FlashcardResponseDto>> GetArchivedAsync(FlashcardsQueryParams queryParams);
        Task<FlashcardResponseDto> CreateAsync(CreateFlashcardDto createDto);
        Task<FlashcardResponseDto> CreateForCollectionAsync(Guid collectionId, CreateFlashcardDto createDto);
        Task<FlashcardResponseDto?> UpdateAsync(Guid id, UpdateFlashcardDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<BatchUpdateResponse> BatchUpdateAsync(BatchUpdateRequest request);
        Task<ArchivedStatisticsDto> GetArchivedStatisticsAsync();
        Task<FlashcardResponseDto?> ArchiveAsync(Guid id);
        Task<FlashcardResponseDto?> UnarchiveAsync(Guid id);
    }
} 