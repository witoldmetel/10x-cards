using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TenXCards.Core.DTOs;
using System.Text.Json;
using System.IO;
using System.Threading.Tasks;
using System;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/test")]
    [Produces("application/json")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }

        [HttpPost("echo")]
        [AllowAnonymous]
        public async Task<IActionResult> EchoRequest()
        {
            try
            {
                // Enable buffering so we can read the request body
                Request.EnableBuffering();
                
                // Read the raw request body
                string requestBody;
                using (var reader = new StreamReader(Request.Body, leaveOpen: true))
                {
                    requestBody = await reader.ReadToEndAsync();
                    // Reset the position for any other middleware that might need to read it
                    Request.Body.Position = 0;
                }
                
                _logger.LogInformation("Received raw request: {Length} bytes", requestBody.Length);
                
                try
                {
                    // Try to parse as a GenerateFlashcardsRequest
                    var flashcardsRequest = JsonSerializer.Deserialize<GenerateFlashcardsRequest>(requestBody);
                    
                    return Ok(new
                    {
                        message = "Successfully parsed as GenerateFlashcardsRequest",
                        parsed = flashcardsRequest,
                        raw = requestBody
                    });
                }
                catch (JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Failed to parse request as GenerateFlashcardsRequest");
                    
                    return BadRequest(new
                    {
                        message = "Failed to parse JSON",
                        error = jsonEx.Message,
                        raw = requestBody
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in echo endpoint");
                return StatusCode(500, new
                {
                    error = ex.Message,
                    stack = ex.StackTrace
                });
            }
        }
    }
} 