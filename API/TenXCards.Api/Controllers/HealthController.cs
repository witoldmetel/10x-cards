using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenXCards.Api.Data;

namespace TenXCards.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthController(ApplicationDbContext context)
        {
            _context = context;
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
                    return Ok("Database connection is healthy");
                }
                
                return StatusCode(503, "Database connection failed");
            }
            catch (Exception ex)
            {
                return StatusCode(503, $"Database connection error: {ex.Message}");
            }
        }
    }
} 