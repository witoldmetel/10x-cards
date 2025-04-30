using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services
{
    public interface ICollectionService
    {
        Task<CollectionsResponse> GetAllAsync(CollectionsQueryParams queryParams);
        Task<CollectionsResponse> GetAllForDashboardAsync();
        Task<CollectionsResponse> GetAllArchivedAsync();
        Task<CollectionResponseDto?> GetByIdAsync(Guid id);
        Task<CollectionResponseDto> CreateAsync(CreateCollectionDto createDto);
        Task<CollectionResponseDto?> UpdateAsync(Guid id, UpdateCollectionDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ArchiveAsync(Guid id);
        Task<bool> UnarchiveAsync(Guid id);
    }
}
