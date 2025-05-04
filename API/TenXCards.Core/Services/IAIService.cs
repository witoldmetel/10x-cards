using System.Collections.Generic;
using System.Threading.Tasks;
using TenXCards.Core.DTOs;
using System.Threading;

namespace TenXCards.Core.Services
{
    public class AIGenerationResult
    {
        public List<CreateFlashcardDto> Flashcards { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
    }

    public interface IAIService
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