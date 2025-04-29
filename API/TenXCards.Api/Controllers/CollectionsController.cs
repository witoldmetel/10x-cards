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
    [Route("api/collections")]
    [Produces("application/json")]
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _collectionService;

        public CollectionsController(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        // GET: api/collections
        [HttpGet]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CollectionResponseDto>>> GetAll()
        {
            var collections = await _collectionService.GetAllAsync();
            return Ok(collections);
        }

        // GET: api/collections/{id}
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CollectionResponseDto>> GetById(Guid id)
        {
            var collection = await _collectionService.GetByIdAsync(id);
            if (collection == null)
            {
                return NotFound();
            }
            return Ok(collection);
        }

        // POST: api/collections
        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CollectionResponseDto>> Create([FromBody] CreateCollectionDto createDto)
        {
            var collection = await _collectionService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = collection.Id }, collection);
        }

        // PUT: api/collections/{id}
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CollectionResponseDto>> Update(Guid id, [FromBody] UpdateCollectionDto updateDto)
        {
            var collection = await _collectionService.UpdateAsync(id, updateDto);
            if (collection == null)
            {
                return NotFound();
            }
            return Ok(collection);
        }

        // DELETE: api/collections/{id}
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(Guid id)
        {
            var success = await _collectionService.DeleteAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        // GET: api/collections/dashboard
        [HttpGet("dashboard")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CollectionResponseDto>>> GetAllForDashboard()
        {
            var collections = await _collectionService.GetAllForDashboardAsync();
            return Ok(collections);
        }

        // GET: api/collections/archived
        [HttpGet("archived")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CollectionResponseDto>>> GetAllArchived()
        {
            var collections = await _collectionService.GetAllArchivedAsync();
            return Ok(collections);
        }

        // PUT: api/collections/{id}/archive
        [HttpPut("{id}/archive")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Archive(Guid id)
        {
            var success = await _collectionService.ArchiveAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        // PUT: api/collections/{id}/unarchive
        [HttpPut("{id}/unarchive")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Unarchive(Guid id)
        {
            var success = await _collectionService.UnarchiveAsync(id);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
