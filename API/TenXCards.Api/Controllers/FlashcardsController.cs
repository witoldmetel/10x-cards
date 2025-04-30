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

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/flashcards")]
    [Produces("application/json")]
    [Authorize]
    public class FlashcardsController : ControllerBase
    {
        private readonly IFlashcardService _flashcardService;

        public FlashcardsController(IFlashcardService flashcardService)
        {
            _flashcardService = flashcardService;
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
        [ProducesResponseType(typeof(FlashcardResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FlashcardResponseDto>> CreateForCollection(Guid collectionId, [FromBody] CreateFlashcardDto createDto)
        {
            var flashcard = await _flashcardService.CreateForCollectionAsync(collectionId, createDto);
            return CreatedAtAction(nameof(GetByCollection), new { collectionId = collectionId }, flashcard);
        }

        // POST: api/collections/{collectionId}/flashcards/generate
        [HttpPost("/api/collections/{collectionId}/flashcards/generate")]
        [Authorize]
        [ProducesResponseType(typeof(GenerateFlashcardsResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GenerateFlashcardsResponse>> GenerateForCollection(
            Guid collectionId, 
            [FromBody] GenerateFlashcardsRequest request)
        {
            var response = await _flashcardService.GenerateFlashcardsAsync(collectionId, request);
            return CreatedAtAction(nameof(GetByCollection), new { collectionId }, response);
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