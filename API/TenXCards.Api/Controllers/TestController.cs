using Microsoft.AspNetCore.Mvc;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public ActionResult<string> Get()
        {
            try
            {
                return Ok("Hello World!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Test endpoint");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
} 