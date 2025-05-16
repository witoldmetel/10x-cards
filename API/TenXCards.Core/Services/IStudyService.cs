using TenXCards.Core.DTOs;

namespace TenXCards.Core.Services
{
    public interface IStudyService
    {
        Task<StudySessionResponse> ProcessStudySessionResults(StudySessionRequest request);
    }
} 