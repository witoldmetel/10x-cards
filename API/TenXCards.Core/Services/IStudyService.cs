using TenXCards.Core.DTOs;
using System.Threading.Tasks;

namespace TenXCards.Core.Services
{
    public interface IStudyService
    {
        Task<StudySessionResponse> ProcessStudySessionResults(StudySessionRequest request);
    }
} 