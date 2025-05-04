using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;
using System.Text.Json.Serialization;
using TenXCards.Core.Models;
using System.Threading;
using System.Text.Json;
using TenXCards.Core.Exceptions;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/flashcards")]
    [Produces("application/json")]
    [Authorize]
    public class FlashcardsController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;
        private readonly IOpenRouterService _openRouterService;

        public FlashcardsController(IFlashcardService flashcardService, IOpenRouterService openRouterService)
        {
            _flashcardService = flashcardService;
            _openRouterService = openRouterService;
        }

        // GET: api/collections/{collectionId}/flashcards
        [HttpGet("/api/collections/{collectionId}/flashcards")]
        [Authorize]
        [ProducesResponseType(typeof(PaginatedResponse<FlashcardResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<FlashcardResponseDto>>> GetByCollection(Guid collectionId, [FromQuery] FlashcardsQueryParams queryParams)
        {
            queryParams.CollectionId = collectionId;
            var flashcards = await _flashcardService.GetAllAsync(queryParams);
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

        // POST: api/collections/{collectionId}/flashcards/generate
        [HttpPost("/api/collections/{collectionId}/flashcards/generate")]
        [Authorize]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(GenerateFlashcardsResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GenerateFlashcardsResponse>> GenerateForCollection(
            Guid collectionId,
            [FromBody] Core.DTOs.GenerateFlashcardsRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request body cannot be empty",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            try
            {
                var response = await _flashcardService.GenerateFlashcardsAsync(collectionId, request);
                return CreatedAtAction(nameof(GetByCollection), new { collectionId }, response);
            }
            catch (Exception ex)
            {
                // Get all nested exception messages
                var allExceptions = new List<string>();
                var currentEx = ex;
                while (currentEx != null)
                {
                    allExceptions.Add($"{currentEx.GetType().Name}: {currentEx.Message}");
                    currentEx = currentEx.InnerException;
                }
                
                var errorMessage = string.Join(" -> ", allExceptions);
                
                // Log the detailed error
                Console.WriteLine($"Error generating flashcards: {errorMessage}");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error generating flashcards",
                    Detail = errorMessage,
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        // POST: api/flashcards/generate
        [HttpPost("generate")]
        [Authorize]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(AIGenerationResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<ActionResult<AIGenerationResult>> GenerateFlashcards(
            [FromBody] GenerateFlashcardsRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid Request",
                    Detail = "Request body cannot be empty",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            try
            {
                var result = await _openRouterService.GenerateFlashcardsAsync(
                    request.SourceText,
                    request.NumberOfCards,
                    request.ApiModelName,
                    request.ApiModelKey,
                    cancellationToken);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return this.HandleApiException(ex);
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
    }
} 