using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class FlashcardsController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;

        public FlashcardsController(IFlashcardService flashcardService)
        {
            _flashcardService = flashcardService;
        }

        /// <summary>
        /// Gets a paginated list of active flashcards with optional filtering
        /// </summary>
        /// <param name="queryParams">Query parameters for pagination and filtering</param>
        /// <returns>A paginated list of flashcards</returns>
        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetAll([FromQuery] FlashcardsQueryParams queryParams)
        {
            var flashcards = await _flashcardService.GetAllAsync(queryParams);
            return Ok(flashcards);
        }

        /// <summary>
        /// Gets a paginated list of archived flashcards with optional filtering
        /// </summary>
        /// <param name="queryParams">Query parameters for pagination and filtering</param>
        /// <returns>A paginated list of archived flashcards</returns>
        [HttpGet("archived")]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetArchived([FromQuery] FlashcardsQueryParams queryParams)
        {
            var flashcards = await _flashcardService.GetArchivedAsync(queryParams);
            return Ok(flashcards);
        }

        /// <summary>
        /// Gets statistics for archived flashcards
        /// </summary>
        /// <returns>Statistics for archived flashcards</returns>
        [HttpGet("archived/statistics")]
        [Authorize]
        [ProducesResponseType(typeof(ArchivedStatisticsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ArchivedStatisticsDto>> GetArchivedStatistics()
        {
            var statistics = await _flashcardService.GetArchivedStatisticsAsync();
            return Ok(statistics);
        }

        /// <summary>
        /// Gets a specific flashcard by ID
        /// </summary>
        /// <param name="id">The ID of the flashcard</param>
        /// <returns>The requested flashcard</returns>
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> GetById(Guid id)
        {
            var flashcard = await _flashcardService.GetByIdAsync(id);
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        /// <summary>
        /// Creates a new flashcard
        /// </summary>
        /// <param name="dto">The flashcard data</param>
        /// <returns>The created flashcard</returns>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> Create([FromBody] CreateFlashcardDto dto)
        {
            var flashcard = await _flashcardService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = flashcard.Id }, flashcard);
        }

        /// <summary>
        /// Updates an existing flashcard
        /// </summary>
        /// <param name="id">The ID of the flashcard to update</param>
        /// <param name="dto">The updated flashcard data</param>
        /// <returns>The updated flashcard</returns>
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> Update(Guid id, [FromBody] UpdateFlashcardDto dto)
        {
            var flashcard = await _flashcardService.UpdateAsync(id, dto);
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        /// <summary>
        /// Updates multiple flashcards in batch
        /// </summary>
        /// <param name="request">The batch update request</param>
        /// <returns>The result of the batch update operation</returns>
        [HttpPut("batch")]
        [Authorize]
        [ProducesResponseType(typeof(BatchUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BatchUpdateResponse>> BatchUpdate([FromBody] BatchUpdateRequest request)
        {
            var result = await _flashcardService.BatchUpdateAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Archives a flashcard
        /// </summary>
        /// <param name="id">The ID of the flashcard to archive</param>
        /// <returns>The archived flashcard</returns>
        [HttpPut("{id}/archive")]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Archive(Guid id)
        {
            var updateDto = new UpdateFlashcardDto { IsArchived = true };
            var flashcard = await _flashcardService.UpdateAsync(id, updateDto);
            
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        /// <summary>
        /// Unarchives a flashcard
        /// </summary>
        /// <param name="id">The ID of the flashcard to unarchive</param>
        /// <returns>The unarchived flashcard</returns>
        [HttpPut("{id}/unarchive")]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Unarchive(Guid id)
        {
            var updateDto = new UpdateFlashcardDto { IsArchived = false };
            var flashcard = await _flashcardService.UpdateAsync(id, updateDto);
            
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        /// <summary>
        /// Permanently deletes a flashcard
        /// </summary>
        /// <param name="id">The ID of the flashcard to delete</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(Guid id)
        {
            var success = await _flashcardService.DeleteAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
} 