using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TenXCards.Core.DTOs;
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

        private void ValidateUserId(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                throw new ArgumentException("User ID cannot be found", nameof(userId));
            }
        }

        public async Task<(IEnumerable<Collection> Items, int Total)> GetAllAsync(CollectionsQueryParams queryParams, Guid userId)
        {
            ValidateUserId(userId);
            var query = _context.Collections.Where(c => c.UserId == userId);

            if (queryParams.Archived.HasValue)
            {
                query = queryParams.Archived.Value
                    ? query.Where(c => c.ArchivedAt != null)
                    : query.Where(c => c.ArchivedAt == null);
            }

            if (!string.IsNullOrWhiteSpace(queryParams.SearchQuery))
            {
                var searchQuery = queryParams.SearchQuery.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(searchQuery) || 
                                        (c.Description != null && c.Description.ToLower().Contains(searchQuery)));
            }

            var total = await query.CountAsync();

            var items = await query
                .Include(c => c.Flashcards)
                .OrderByDescending(c => c.CreatedAt)
                .Skip(queryParams.Offset)
                .Take(queryParams.Limit)
                .ToListAsync();

            return (items, total);
        }

        public async Task<IEnumerable<Collection>> GetAllForDashboardAsync(Guid userId)
        {
            ValidateUserId(userId);

            return await _context.Collections
                .Where(c => c.UserId == userId && c.ArchivedAt == null &&
                    _context.Flashcards.Any(f => f.CollectionId == c.Id && f.ArchivedAt == null))
                .Include(c => c.Flashcards)
                .ToListAsync();
        }

        public async Task<IEnumerable<Collection>> GetAllArchivedAsync(Guid userId)
        {
            ValidateUserId(userId);

            return await _context.Collections
                .Where(c => c.UserId == userId && c.ArchivedAt != null)
                .ToListAsync();
        }

        public async Task<Collection?> GetByIdAsync(Guid id, Guid userId)
        {
            ValidateUserId(userId);
            return await _context.Collections
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        }

        public async Task<Collection> CreateAsync(Collection collection)
        {
            ValidateUserId(collection.UserId);
            
            collection.CreatedAt = DateTime.UtcNow;
            collection.UpdatedAt = DateTime.UtcNow;
            collection.TotalCards = 0;
            collection.DueCards = 0;
            
            _context.Collections.Add(collection);
            await _context.SaveChangesAsync();
            
            // Reload the collection to ensure we have all the properties
            var created = await _context.Collections
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == collection.Id);
            
            if (created == null)
                throw new InvalidOperationException("Failed to create collection");
            
            return created;
        }

        public async Task<Collection?> UpdateAsync(Collection collection)
        {
            ValidateUserId(collection.UserId);
            var existing = await _context.Collections.FirstOrDefaultAsync(c => c.Id == collection.Id && c.UserId == collection.UserId);
            if (existing == null) return null;

            existing.Name = collection.Name;
            existing.Description = collection.Description;
            existing.Color = collection.Color;
            existing.Tags = collection.Tags;
            existing.Categories = collection.Categories;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            ValidateUserId(userId);
            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (collection == null) return false;

            _context.Collections.Remove(collection);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ArchiveAsync(Guid id, Guid userId)
        {
            ValidateUserId(userId);
            var collection = await _context.Collections
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (collection == null) return false;

            var now = DateTime.UtcNow;
            collection.ArchivedAt = now;

            // Archive all flashcards in the collection
            foreach (var flashcard in collection.Flashcards)
            {
                flashcard.ArchivedAt = now;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnarchiveAsync(Guid id, Guid userId)
        {
            ValidateUserId(userId);
            var collection = await _context.Collections
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (collection == null) return false;

            collection.ArchivedAt = null;

            // Unarchive all flashcards in the collection
            foreach (var flashcard in collection.Flashcards)
            {
                flashcard.ArchivedAt = null;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateCollectionStatistics(Guid collectionId)
        {
            var collection = await _context.Collections
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == collectionId);

            if (collection == null) return;

            var now = DateTime.UtcNow;

            // Calculate total cards (including archived)
            collection.TotalCards = collection.Flashcards.Count;

            // Calculate due cards (non-archived cards that are either new or due for review)
            collection.DueCards = collection.Flashcards.Count(f => 
                f.ArchivedAt == null && 
                (f.ReviewStatus == ReviewStatus.New || 
                (f.Sm2DueDate.HasValue && f.Sm2DueDate.Value <= now)));

            // Calculate last studied time
            collection.LastStudied = collection.Flashcards
                .Where(f => f.ReviewedAt != null)
                .Max(f => f.ReviewedAt);

            collection.MasteryLevel = 0;

            await _context.SaveChangesAsync();
        }
    }
}
