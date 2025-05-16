using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;

namespace TenXCards.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase
    {
        private readonly IStudyService _studyService;

        public StudyController(IStudyService studyService)
        {
            _studyService = studyService;
        }

        [HttpPost("session")]
        public async Task<ActionResult<StudySessionResponse>> SubmitStudySession([FromBody] StudySessionRequest request)
        {
            var response = await _studyService.ProcessStudySessionResults(request);
            return Ok(response);
        }
    }
} 