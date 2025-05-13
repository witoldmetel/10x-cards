using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services
{
    public interface ICollectionService
    {
        Task<CollectionsResponse> GetAllAsync(CollectionsQueryParams queryParams, Guid userId);
        Task<CollectionsResponse> GetAllForDashboardAsync(Guid userId);
        Task<CollectionsResponse> GetAllArchivedAsync(Guid userId);
        Task<CollectionResponseDto?> GetByIdAsync(Guid id, Guid userId);
        Task<CollectionResponseDto> CreateAsync(CreateCollectionDto createDto, Guid userId);
        Task<CollectionResponseDto?> UpdateAsync(Guid id, UpdateCollectionDto updateDto, Guid userId);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<bool> ArchiveAsync(Guid id, Guid userId);
        Task<bool> UnarchiveAsync(Guid id, Guid userId);
    }
}
