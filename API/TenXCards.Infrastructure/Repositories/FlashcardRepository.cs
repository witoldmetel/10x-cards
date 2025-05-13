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
    public class FlashcardRepository : IFlashcardRepository
    {
        private readonly ApplicationDbContext _context;

        public FlashcardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Flashcard?> GetByIdAsync(Guid id)
        {
            return await _context.Flashcards
                .Include(f => f.Collection)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<Flashcard?> GetByCollectionIdAsync(Guid collectionId)
        {
            return await _context.Flashcards
                .Include(f => f.Collection)
                .FirstOrDefaultAsync(f => f.CollectionId == collectionId);
        }

        public async Task<(IEnumerable<Flashcard> Items, int Total)> GetAllAsync(FlashcardsQueryParams queryParams)
        {
            var query = _context.Flashcards.AsQueryable();

            if (queryParams.CollectionId.HasValue)
            {
                query = query.Where(f => f.CollectionId == queryParams.CollectionId);
            }

            if (queryParams.Archived.HasValue)
            {
                query = queryParams.Archived.Value
                    ? query.Where(f => f.ArchivedAt != null)
                    : query.Where(f => f.ArchivedAt == null);
            }

            query = ApplyFilters(query, queryParams);

            // Join with collections to filter by userId
            query = query.Join(
                _context.Collections,
                f => f.CollectionId,
                c => c.Id,
                (f, c) => new { Flashcard = f, Collection = c })
                .Where(x => x.Collection.UserId == queryParams.UserId)
                .Select(x => x.Flashcard);

            var total = await query.CountAsync();

            var items = await query
                .Include(f => f.Collection)
                .OrderByDescending(f => f.CreatedAt)
                .Skip(queryParams.Offset)
                .Take(queryParams.Limit)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Flashcard> CreateAsync(Flashcard flashcard)
        {
            flashcard.CreatedAt = DateTime.UtcNow;
            
            // Set default review status based on creation source
            if (flashcard.CreationSource == FlashcardCreationSource.Manual)
            {
                flashcard.ReviewStatus = ReviewStatus.Approved;
            }
            else
            {
                flashcard.ReviewStatus = ReviewStatus.New;
            }

            _context.Flashcards.Add(flashcard);
            await _context.SaveChangesAsync();

            // Update collection statistics
            await UpdateCollectionStatistics(flashcard.CollectionId);

            return flashcard;
        }

        public async Task<Flashcard?> UpdateAsync(Flashcard flashcard)
        {
            var existingFlashcard = await _context.Flashcards.FindAsync(flashcard.Id);
            if (existingFlashcard == null)
                return null;

            existingFlashcard.Front = flashcard.Front;
            existingFlashcard.Back = flashcard.Back;

            if (flashcard.ReviewStatus != existingFlashcard.ReviewStatus)
            {
                existingFlashcard.ReviewStatus = flashcard.ReviewStatus;
                existingFlashcard.ReviewedAt = DateTime.UtcNow;
            }

            if (flashcard.ArchivedAt != existingFlashcard.ArchivedAt)
            {
                existingFlashcard.ArchivedAt = flashcard.ArchivedAt;
                await UpdateCollectionStatistics(existingFlashcard.CollectionId);
            }

            existingFlashcard.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return existingFlashcard;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);
            if (flashcard == null)
                return false;

            var collectionId = flashcard.CollectionId;
            _context.Flashcards.Remove(flashcard);
            await _context.SaveChangesAsync();

            // Update collection statistics
            await UpdateCollectionStatistics(collectionId);

            return true;
        }

        public async Task<IEnumerable<Flashcard>> UpdateManyAsync(IEnumerable<Guid> ids, Action<Flashcard> updateAction)
        {
            var flashcards = await _context.Flashcards
                .Where(f => ids.Contains(f.Id))
                .ToListAsync();

            var now = DateTime.UtcNow;
            var affectedCollections = new HashSet<Guid>();

            foreach (var flashcard in flashcards)
            {
                var oldStatus = flashcard.ReviewStatus;
                var oldArchivedAt = flashcard.ArchivedAt;

                updateAction(flashcard);
                
                if (flashcard.ReviewStatus != oldStatus)
                {
                    flashcard.ReviewedAt = now;
                }

                if (flashcard.ArchivedAt != oldArchivedAt)
                {
                    affectedCollections.Add(flashcard.CollectionId);
                }

                flashcard.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();

            // Update statistics for affected collections
            foreach (var collectionId in affectedCollections)
            {
                await UpdateCollectionStatistics(collectionId);
            }

            return flashcards;
        }

        public async Task<bool> UpdateSM2Parameters(Guid id, int repetitions, int interval, double eFactor, DateTime dueDate)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);
            if (flashcard == null) return false;

            flashcard.Sm2Repetitions = repetitions;
            flashcard.Sm2Interval = interval;
            flashcard.Sm2Efactor = eFactor;
            flashcard.Sm2DueDate = dueDate;
            flashcard.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await UpdateCollectionStatistics(flashcard.CollectionId);

            return true;
        }

        private static IQueryable<Flashcard> ApplyFilters(IQueryable<Flashcard> query, FlashcardsQueryParams queryParams)
        {
            if (queryParams.ReviewStatus.HasValue)
            {
                query = query.Where(f => f.ReviewStatus == queryParams.ReviewStatus.Value);
            }

            if (!string.IsNullOrWhiteSpace(queryParams.SearchPhrase))
            {
                var searchPhrase = queryParams.SearchPhrase.ToLower();
                query = query.Where(f => 
                    f.Front.ToLower().Contains(searchPhrase) || 
                    f.Back.ToLower().Contains(searchPhrase));
            }

            return query;
        }

        private async Task UpdateCollectionStatistics(Guid collectionId)
        {
            var collection = await _context.Collections.FindAsync(collectionId);
            if (collection == null) return;

            var stats = await _context.Flashcards
                .Where(f => f.CollectionId == collectionId && f.ArchivedAt == null)
                .GroupBy(f => 1)
                .Select(g => new
                {
                    TotalCards = g.Count(),
                    DueCards = g.Count(f => f.Sm2DueDate <= DateTime.UtcNow)
                })
                .FirstOrDefaultAsync();

            if (stats != null)
            {
                collection.TotalCards = stats.TotalCards;
                collection.DueCards = stats.DueCards;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Flashcard?> GetFlashcardBySourceHash(string sourceTextHash, Guid collectionId)
        {
            return await _context.Flashcards
                .FirstOrDefaultAsync(f => 
                    f.SourceTextHash == sourceTextHash && 
                    f.CollectionId == collectionId &&
                    f.ArchivedAt == null);
        }
    }
} 