using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;

namespace TenXCards.Core.Repositories
{
    public interface ICollectionRepository
    {
        Task<(IEnumerable<Collection> Items, int Total)> GetAllAsync(CollectionsQueryParams queryParams, Guid userId);
        Task<IEnumerable<Collection>> GetAllForDashboardAsync(Guid userId);
        Task<IEnumerable<Collection>> GetAllArchivedAsync(Guid userId);
        Task<Collection?> GetByIdAsync(Guid id, Guid userId);
        Task<Collection> CreateAsync(Collection collection);
        Task<Collection?> UpdateAsync(Collection collection);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<bool> ArchiveAsync(Guid id, Guid userId);
        Task<bool> UnarchiveAsync(Guid id, Guid userId);
        Task UpdateCollectionStatistics(Guid collectionId);
    }
}
