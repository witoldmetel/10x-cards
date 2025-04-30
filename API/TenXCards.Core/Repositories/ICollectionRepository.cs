using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;

namespace TenXCards.Core.Repositories
{
    public interface ICollectionRepository
    {
        Task<(IEnumerable<Collection> Items, int Total)> GetAllAsync(CollectionsQueryParams queryParams);
        Task<IEnumerable<Collection>> GetAllForDashboardAsync();
        Task<IEnumerable<Collection>> GetAllArchivedAsync();
        Task<Collection?> GetByIdAsync(Guid id);
        Task<Collection> CreateAsync(Collection collection);
        Task<Collection?> UpdateAsync(Collection collection);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ArchiveAsync(Guid id);
        Task<bool> UnarchiveAsync(Guid id);
        Task UpdateCollectionStatistics(Guid collectionId);
    }
}
