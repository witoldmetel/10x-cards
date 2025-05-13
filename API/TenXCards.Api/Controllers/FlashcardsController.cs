using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;
using TenXCards.Core.Models;
using System.Threading;
using Microsoft.Extensions.Logging;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/flashcards")]
    [Produces("application/json")]
    [Authorize]
    public class FlashcardsController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        private readonly ILogger<FlashcardsController> _logger;

        public FlashcardsController(
            IFlashcardService flashcardService, 
            ILogger<FlashcardsController> logger)
        {
            _flashcardService = flashcardService;
            _logger = logger;
        }

        // GET: api/collections/{collectionId}/flashcards
        [HttpGet("/api/collections/{collectionId}/flashcards")]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetByCollection(Guid collectionId, [FromQuery] FlashcardsQueryParams queryParams)
        {
            var collectionQueryParams = new FlashcardsQueryParams
            {
                Offset = queryParams.Offset,
                Limit = queryParams.Limit,
                ReviewStatus = queryParams.ReviewStatus,
                SearchPhrase = queryParams.SearchPhrase,
                Archived = queryParams.Archived,
                CollectionId = collectionId
            };
            
            var flashcards = await _flashcardService.GetAllAsync(collectionQueryParams);
            return Ok(flashcards);
        }

        // POST: api/collections/{collectionId}/flashcards
        [HttpPost("/api/collections/{collectionId}/flashcards")]
        [Authorize]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> CreateForCollection(Guid collectionId, [FromBody] CreateFlashcardDto createDto)
        {
            try 
            {
                var flashcard = await _flashcardService.CreateForCollectionAsync(collectionId, createDto);
                return CreatedAtAction(nameof(GetByCollection), new { collectionId }, flashcard);
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Bad Request",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        // PUT: api/flashcards/{id}
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

        // PUT: api/flashcards/{id}/archive
        [HttpPut("{id}/archive")]
        [Authorize]
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Archive(Guid id)
        {
            var flashcard = await _flashcardService.ArchiveAsync(id);
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        // PUT: api/flashcards/{id}/unarchive
        [HttpPut("{id}/unarchive")]
        [Authorize] 
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FlashcardResponseDto>> Unarchive(Guid id)
        {
            var flashcard = await _flashcardService.UnarchiveAsync(id);
            if (flashcard == null)
            {
                return NotFound();
            }
            return Ok(flashcard);
        }

        // DELETE: api/flashcards/{id}
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

        // POST: api/collections/{collectionId}/flashcards/generate
        [HttpPost("/api/collections/{collectionId}/flashcards/generate")]
        [Authorize]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(List<FlashcardResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<List<FlashcardResponseDto>>> GenerateForCollection(
            Guid collectionId, 
            [FromBody] FlashcardGenerationRequestDto request,
            CancellationToken cancellationToken)
        {
            try 
            {
                var result = await _flashcardService.GenerateFlashcardsAsync(request, collectionId, cancellationToken);
                return CreatedAtAction(nameof(GetByCollection), new { collectionId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating flashcards: {Error}", ex.Message);
                return BadRequest(new ProblemDetails
                {
                    Title = "Bad Request",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }
    }
} 