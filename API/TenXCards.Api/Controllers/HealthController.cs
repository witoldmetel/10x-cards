using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenXCards.Infrastructure.Data;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/health")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HealthController> _logger;

        public HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("db")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                // Try to connect to the database
                bool canConnect = await _context.Database.CanConnectAsync();
                
                if (canConnect)
                {
                    _logger.LogInformation("Database connection check successful");
                    return Ok("Database connection is healthy");
                }
                
                _logger.LogWarning("Database connection check failed");
                return StatusCode(503, "Database connection failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection error occurred");
                return StatusCode(503, $"Database connection error: {ex.Message}");
            }
        }
    }
} 