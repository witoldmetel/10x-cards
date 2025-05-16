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
        private readonly IUserContextService _userContextService;

        public StudyController(IStudyService studyService, IUserContextService userContextService)
        {
            _studyService = studyService;
            _userContextService = userContextService;
        }

        [HttpPost("session")]
        public async Task<ActionResult<StudySessionResponse>> SubmitStudySession([FromBody] StudySessionRequest request)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                request = request with { UserId = userId };
                var response = await _studyService.ProcessStudySessionResults(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Unauthorized",
                    Detail = "User is not authenticated",
                    Status = StatusCodes.Status401Unauthorized
                });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Collection not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Study session processing failed",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }
    }
} 