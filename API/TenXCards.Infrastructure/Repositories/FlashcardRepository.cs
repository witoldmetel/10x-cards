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

        public async Task<Flashcard> GetByIdAsync(Guid id)
        {
            return await _context.Flashcards.FindAsync(id);
        }

        public async Task<(IEnumerable<Flashcard> Items, int Total)> GetAllAsync(FlashcardsQueryParams queryParams)
        {
            var query = _context.Flashcards
                .Where(f => f.ArchivedAt == null)
                .AsQueryable();

            if (queryParams.CollectionId.HasValue)
                query = query.Where(f => f.CollectionId == queryParams.CollectionId.Value);

            query = ApplyFilters(query, queryParams);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((queryParams.Page - 1) * queryParams.Limit)
                .Take(queryParams.Limit)
                .ToListAsync();

            return (items, total);
        }

        public async Task<(IEnumerable<Flashcard> Items, int Total)> GetArchivedAsync(FlashcardsQueryParams queryParams)
        {
            var query = _context.Flashcards
                .Where(f => f.ArchivedAt != null)
                .AsQueryable();

            if (queryParams.CollectionId.HasValue)
                query = query.Where(f => f.CollectionId == queryParams.CollectionId.Value);

            query = ApplyFilters(query, queryParams);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.ArchivedAt ?? f.UpdatedAt ?? f.CreatedAt)
                .Skip((queryParams.Page - 1) * queryParams.Limit)
                .Take(queryParams.Limit)
                .ToListAsync();

            return (items, total);
        }

        public async Task<Flashcard> CreateAsync(Flashcard flashcard)
        {
            flashcard.CreatedAt = DateTime.UtcNow;
            _context.Flashcards.Add(flashcard);
            await _context.SaveChangesAsync();
            return flashcard;
        }

        public async Task<Flashcard> UpdateAsync(Flashcard flashcard)
        {
            var existingFlashcard = await _context.Flashcards.FindAsync(flashcard.Id);
            if (existingFlashcard == null)
                return null;

            existingFlashcard.Front = flashcard.Front;
            existingFlashcard.Back = flashcard.Back;
            existingFlashcard.Tags = flashcard.Tags;
            existingFlashcard.Category = flashcard.Category;
            existingFlashcard.ReviewStatus = flashcard.ReviewStatus;
            existingFlashcard.UpdatedAt = DateTime.UtcNow;

            if (flashcard.ArchivedAt != existingFlashcard.ArchivedAt)
            {
                existingFlashcard.ArchivedAt = flashcard.ArchivedAt;
            }

            await _context.SaveChangesAsync();
            return existingFlashcard;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);
            if (flashcard == null)
                return false;

            _context.Flashcards.Remove(flashcard);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Flashcard>> UpdateManyAsync(IEnumerable<Guid> ids, Action<Flashcard> updateAction)
        {
            var flashcards = await _context.Flashcards
                .Where(f => ids.Contains(f.Id))
                .ToListAsync();

            foreach (var flashcard in flashcards)
            {
                updateAction(flashcard);
                flashcard.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return flashcards;
        }

        public async Task<Dictionary<string, int>> GetArchivedCountByCategory()
        {
            return await _context.Flashcards
                .Where(f => f.ArchivedAt != null)
                .SelectMany(f => f.Category)
                .GroupBy(category => category)
                .Select(group => new { Category = group.Key, Count = group.Count() })
                .ToDictionaryAsync(x => x.Category, x => x.Count);
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

            if (!string.IsNullOrWhiteSpace(queryParams.Tag))
            {
                var tag = queryParams.Tag.ToLower();
                query = query.Where(f => f.Tags.Any(t => t.ToLower() == tag));
            }

            if (!string.IsNullOrWhiteSpace(queryParams.Category))
            {
                var category = queryParams.Category.ToLower();
                query = query.Where(f => f.Category.Any(c => c.ToLower() == category));
            }

            return query;
        }
    }
} 