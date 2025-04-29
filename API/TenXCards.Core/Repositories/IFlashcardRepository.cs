using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;

namespace TenXCards.Core.Repositories
{
    public interface IFlashcardRepository
    {
        Task<Flashcard?> GetByIdAsync(Guid id);
        Task<(IEnumerable<Flashcard> Items, int Total)> GetAllAsync(FlashcardsQueryParams queryParams);
        Task<(IEnumerable<Flashcard> Items, int Total)> GetArchivedAsync(FlashcardsQueryParams queryParams);
        Task<Flashcard> CreateAsync(Flashcard flashcard);
        Task<Flashcard?> UpdateAsync(Flashcard flashcard);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<Flashcard>> UpdateManyAsync(IEnumerable<Guid> ids, Action<Flashcard> updateAction);
        Task<Dictionary<string, int>> GetArchivedCountByCategory();
    }
} 