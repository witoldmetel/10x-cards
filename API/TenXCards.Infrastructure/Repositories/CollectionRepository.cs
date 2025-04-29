using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Infrastructure.Data;

namespace TenXCards.Infrastructure.Repositories
{
    public class CollectionRepository : ICollectionRepository
    {
        private readonly ApplicationDbContext _context;

        public CollectionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Collection>> GetAllAsync()
        {
            return await _context.Collections.Where(c => c.ArchivedAt == null).ToListAsync();
        }

                public async Task<IEnumerable<Collection>> GetAllForDashboardAsync()
        {
            // Only collections that are not archived and have at least one active flashcard
            return await _context.Collections
                .Where(c => c.ArchivedAt == null &&
                    _context.Flashcards.Any(f => f.CollectionId == c.Id && f.ArchivedAt == null))
                .ToListAsync();
        }

        public async Task<IEnumerable<Collection>> GetAllArchivedAsync()
        {
            return await _context.Collections.Where(c => c.ArchivedAt != null).ToListAsync();
        }

        public async Task<Collection?> GetByIdAsync(Guid id)
        {
            return await _context.Collections.FindAsync(id);
        }

        public async Task<Collection> CreateAsync(Collection collection)
        {
            collection.CreatedAt = DateTime.UtcNow;
            _context.Collections.Add(collection);
            await _context.SaveChangesAsync();
            return collection;
        }

        public async Task<Collection?> UpdateAsync(Collection collection)
        {
            var existing = await _context.Collections.FindAsync(collection.Id);
            if (existing == null) return null;
            existing.Name = collection.Name;
            existing.Description = collection.Description;
            existing.Color = collection.Color;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var collection = await _context.Collections.FindAsync(id);
            if (collection == null) return false;
            _context.Collections.Remove(collection);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ArchiveAsync(Guid id)
        {
            var collection = await _context.Collections.FindAsync(id);
            if (collection == null) return false;
            collection.ArchivedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnarchiveAsync(Guid id)
        {
            var collection = await _context.Collections.FindAsync(id);
            if (collection == null) return false;
            collection.ArchivedAt = null;
            await _context.SaveChangesAsync();
            return true;
        }


    }
}
