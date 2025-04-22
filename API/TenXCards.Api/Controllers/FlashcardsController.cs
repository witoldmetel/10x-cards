using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlashcardsController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;

        public FlashcardsController(IFlashcardService flashcardService)
        {
            _flashcardService = flashcardService;
        }

        /// <summary>
        /// Gets all active (non-archived) flashcards with pagination and filtering
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetAll([FromQuery] FlashcardsQueryParams queryParams)
        {
            var flashcards = await _flashcardService.GetAllAsync(queryParams);
            return Ok(flashcards);
        }

        /// <summary>
        /// Gets all archived flashcards with pagination and filtering
        /// </summary>
        [HttpGet("archived")]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetArchived([FromQuery] FlashcardsQueryParams queryParams)
        {
            var flashcards = await _flashcardService.GetArchivedAsync(queryParams);
            return Ok(flashcards);
        }

        /// <summary>
        /// Gets archived flashcards statistics
        /// </summary>
        [HttpGet("archived/statistics")]
        [ProducesResponseType(typeof(ArchivedStatisticsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ArchivedStatisticsDto>> GetArchivedStatistics()
        {
            var statistics = await _flashcardService.GetArchivedStatisticsAsync();
            return Ok(statistics);
        }

        /// <summary>
        /// Gets a specific flashcard by id
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> GetById(Guid id)
        {
            var flashcard = await _flashcardService.GetByIdAsync(id);
            if (flashcard == null)
                return NotFound();

            return Ok(flashcard);
        }

        /// <summary>
        /// Creates a new flashcard
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> Create([FromBody] CreateFlashcardDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var flashcard = await _flashcardService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = flashcard.Id }, flashcard);
        }

        /// <summary>
        /// Updates an existing flashcard
        /// </summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> Update(Guid id, [FromBody] UpdateFlashcardDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var flashcard = await _flashcardService.UpdateAsync(id, updateDto);
            if (flashcard == null)
                return NotFound();

            return Ok(flashcard);
        }

        /// <summary>
        /// Updates multiple flashcards simultaneously
        /// </summary>
        [HttpPatch("batch")]
        [ProducesResponseType(typeof(BatchUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BatchUpdateResponse>> BatchUpdate([FromBody] BatchUpdateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _flashcardService.BatchUpdateAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Archives a flashcard
        /// </summary>
        [HttpPatch("{id:guid}/archive")]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Archive(Guid id)
        {
            var updateDto = new UpdateFlashcardDto { IsArchived = true };
            var flashcard = await _flashcardService.UpdateAsync(id, updateDto);
            
            if (flashcard == null)
                return NotFound();

            return Ok(flashcard);
        }

        /// <summary>
        /// Unarchives a flashcard
        /// </summary>
        [HttpPatch("{id:guid}/unarchive")]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Unarchive(Guid id)
        {
            var updateDto = new UpdateFlashcardDto { IsArchived = false };
            var flashcard = await _flashcardService.UpdateAsync(id, updateDto);
            
            if (flashcard == null)
                return NotFound();

            return Ok(flashcard);
        }

        /// <summary>
        /// Permanently deletes a flashcard
        /// </summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _flashcardService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
} 