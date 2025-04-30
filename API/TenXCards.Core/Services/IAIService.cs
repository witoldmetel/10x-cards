using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using System.Threading;

namespace TenXCards.Core.Services
{
    public interface IAIService
    {
        string DefaultModelName { get; }
        Task<List<CreateFlashcardDto>> GenerateFlashcardsAsync(
            string sourceText, 
            int numberOfCards, 
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default);
    }
} 