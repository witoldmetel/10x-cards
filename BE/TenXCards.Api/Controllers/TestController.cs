using Microsoft.AspNetCore.Mvc;
using Supabase;
using Npgsql;
using Microsoft.Extensions.Configuration;
using TenXCards.Api.Models;

namespace TenXCards.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    private readonly Client _supabaseClient;
    private readonly IConfiguration _configuration;

    public TestController(Client supabaseClient, IConfiguration configuration)
    {
        _supabaseClient = supabaseClient;
        _configuration = configuration;
    }

    [HttpGet("test-supabase")]
    public async Task<IActionResult> TestSupabaseConnection()
    {
        try
        {
            // Test Supabase client connection
            var response = await _supabaseClient.From<Flashcard>().Get();
            return Ok(new { message = "Supabase client connection successful", data = response });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Supabase client connection failed", error = ex.Message });
        }
    }

    [HttpGet("test-db")]
    public async Task<IActionResult> TestDatabaseConnection()
    {
        try
        {
            // Test direct database connection
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            
            using var command = new NpgsqlCommand("SELECT current_timestamp", connection);
            var result = await command.ExecuteScalarAsync();
            
            return Ok(new { message = "Database connection successful", timestamp = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Database connection failed", error = ex.Message });
        }
    }
} 