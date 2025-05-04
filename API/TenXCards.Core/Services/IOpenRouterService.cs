using System.Threading;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services
{
    public interface IOpenRouterService
    {
        string DefaultModelName { get; }
        
        Task<AIGenerationResult> GenerateFlashcardsAsync(
            string sourceText,
            int numberOfCards,
            string? modelName = null,
            string? apiModelKey = null,
            CancellationToken cancellationToken = default);
    }
} 