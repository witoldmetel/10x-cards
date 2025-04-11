using Microsoft.AspNetCore.Mvc;
using Supabase;
using System.Threading.Tasks;
using System;
using TenXCards.Api.Models;

namespace TenXCards.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlashcardsController : ControllerBase
    {
        private readonly Client _supabase;

        public FlashcardsController(Client supabase)
        {
            _supabase = supabase;
        }

        // GET: api/flashcards
        [HttpGet]
        public async Task<IActionResult> GetFlashcards()
        {
            try
            {
                var response = await _supabase
                    .From<Flashcard>()
                    .Get();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/flashcards/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFlashcard(string id)
        {
            try
            {
                var response = await _supabase
                    .From<Flashcard>()
                    .Filter("id", Postgrest.Constants.Operator.Equals, id)
                    .Single();

                if (response == null)
                    return NotFound();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/flashcards
        [HttpPost]
        public async Task<IActionResult> CreateFlashcard([FromBody] Flashcard flashcard)
        {
            try
            {
                var response = await _supabase
                    .From<Flashcard>()
                    .Insert(flashcard);

                return CreatedAtAction(nameof(GetFlashcard), new { id = flashcard.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/flashcards/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlashcard(string id, [FromBody] Flashcard flashcard)
        {
            try
            {
                var response = await _supabase
                    .From<Flashcard>()
                    .Filter("id", Postgrest.Constants.Operator.Equals, id)
                    .Update(flashcard);

                if (response == null)
                    return NotFound();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/flashcards/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlashcard(string id)
        {
            try
            {
                await _supabase
                    .From<Flashcard>()
                    .Filter("id", Postgrest.Constants.Operator.Equals, id)
                    .Delete();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 