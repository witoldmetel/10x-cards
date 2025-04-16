using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using TenXCards.Api.Data;
using TenXCards.Api.Models;
using TenXCards.Api.DTOs;

namespace TenXCards.Api.Controllers
{
    /// <summary>
    /// Controller for managing flashcards
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FlashcardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public FlashcardsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Retrieves all flashcards with optional filtering
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FlashcardResponse>>> GetFlashcards([FromQuery] FlashcardFilterRequest filter)
        {
            // Start with base query
            var query = _context.Flashcards.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(filter.ReviewStatus))
            {
                query = query.Where(f => f.ReviewStatus == filter.ReviewStatus);
            }

            if (filter.IncludeArchived.HasValue)
            {
                query = query.Where(f => f.Archived == filter.IncludeArchived.Value);
            }

            if (filter.Tags?.Any() == true)
            {
                query = query.Where(f => f.Tag != null && f.Tag.Any(t => filter.Tags.Contains(t)));
            }

            if (filter.Categories?.Any() == true)
            {
                query = query.Where(f => f.Category != null && f.Category.Any(c => filter.Categories.Contains(c)));
            }

            if (filter.DueDateFrom.HasValue)
            {
                query = query.Where(f => f.Sm2DueDate >= filter.DueDateFrom.Value);
            }

            if (filter.DueDateTo.HasValue)
            {
                query = query.Where(f => f.Sm2DueDate <= filter.DueDateTo.Value);
            }

            var flashcards = await query.ToListAsync();
            return _mapper.Map<List<FlashcardResponse>>(flashcards);
        }

        /// <summary>
        /// Retrieves a specific flashcard by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<FlashcardResponse>> GetFlashcard(string id)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);

            if (flashcard == null)
            {
                return NotFound();
            }

            return _mapper.Map<FlashcardResponse>(flashcard);
        }

        /// <summary>
        /// Creates a new flashcard
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<FlashcardResponse>> CreateFlashcard([FromBody] CreateFlashcardRequest request)
        {
            var flashcard = _mapper.Map<Flashcard>(request);
            
            _context.Flashcards.Add(flashcard);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFlashcard),
                new { id = flashcard.Id },
                _mapper.Map<FlashcardResponse>(flashcard)
            );
        }

        /// <summary>
        /// Updates an existing flashcard
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlashcard(string id, [FromBody] UpdateFlashcardRequest request)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);

            if (flashcard == null)
            {
                return NotFound();
            }

            // Map update request to entity, preserving unchanged values
            _mapper.Map(request, flashcard);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FlashcardExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a flashcard
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlashcard(string id)
        {
            var flashcard = await _context.Flashcards.FindAsync(id);
            if (flashcard == null)
            {
                return NotFound();
            }

            _context.Flashcards.Remove(flashcard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FlashcardExists(string id)
        {
            return _context.Flashcards.Any(e => e.Id == id);
        }
    }
} 