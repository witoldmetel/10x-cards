using System;
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
    [Authorize]
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _collectionService;
        private readonly IUserContextService _userContextService;

        public CollectionsController(ICollectionService collectionService, IUserContextService userContextService)
        {
            _collectionService = collectionService;
            _userContextService = userContextService;
        }

        /// <summary>
        /// Get all collections with pagination
        /// </summary>
        /// <param name="offset">Number of items to skip</param>
        /// <param name="limit">Maximum number of items to return</param>
        /// <param name="archived">Filter by archived status (optional)</param>
        /// <param name="searchQuery">Search query (optional)</param>
        [HttpGet]
        [ProducesResponseType(typeof(PaginatedResponse<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<CollectionResponseDto>>> GetAll(
            [FromQuery] int offset = 0,
            [FromQuery] int limit = 10,
            [FromQuery] bool? archived = null,
            [FromQuery] string? searchQuery = null)
        {
            var queryParams = new CollectionsQueryParams
            {
                Offset = offset,
                Limit = limit,
                Archived = archived,
                SearchQuery = searchQuery
            };

            var userId = _userContextService.GetUserId();
            var response = await _collectionService.GetAllAsync(queryParams, userId);
            return Ok(response);
        }

        /// <summary>
        /// Get collection by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CollectionResponseDto>> GetById(Guid id)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var collection = await _collectionService.GetByIdAsync(id, userId);
                if (collection == null)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Collection not found",
                        Detail = "The requested collection does not exist or you don't have access to it",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return Ok(collection);
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Collection not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }

        /// <summary>
        /// Create a new collection
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CollectionResponseDto>> Create([FromBody] CreateCollectionDto request)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var collection = await _collectionService.CreateAsync(request, userId);
                return CreatedAtAction(nameof(GetById), new { id = collection.Id }, collection);
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Failed to create collection",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        /// <summary>
        /// Update a collection
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(CollectionResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CollectionResponseDto>> Update(Guid id, [FromBody] UpdateCollectionDto request)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var collection = await _collectionService.UpdateAsync(id, request, userId);
                if (collection == null)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Collection not found",
                        Detail = "The requested collection does not exist or you don't have access to it",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return Ok(collection);
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Failed to update collection",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        /// <summary>
        /// Delete a collection
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var result = await _collectionService.DeleteAsync(id, userId);
                if (!result)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Collection not found",
                        Detail = "The requested collection does not exist or you don't have access to it",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Collection not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }

        /// <summary>
        /// Get collections for dashboard
        /// </summary>
        [HttpGet("dashboard")]
        [ProducesResponseType(typeof(PaginatedResponse<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<CollectionResponseDto>>> GetDashboard()
        {
            var userId = _userContextService.GetUserId();
            var response = await _collectionService.GetAllForDashboardAsync(userId);
            return Ok(response);
        }

        /// <summary>
        /// Get archived collections
        /// </summary>
        [HttpGet("archived")]
        [ProducesResponseType(typeof(PaginatedResponse<CollectionResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResponse<CollectionResponseDto>>> GetArchived()
        {
            var userId = _userContextService.GetUserId();
            var response = await _collectionService.GetAllArchivedAsync(userId);
            return Ok(response);
        }

        /// <summary>
        /// Archive a collection
        /// </summary>
        [HttpPut("{id}/archive")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Archive(Guid id)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var result = await _collectionService.ArchiveAsync(id, userId);
                if (!result)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Collection not found",
                        Detail = "The requested collection does not exist or you don't have access to it",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Collection not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }

        /// <summary>
        /// Unarchive a collection
        /// </summary>
        [HttpPut("{id}/unarchive")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Unarchive(Guid id)
        {
            try
            {
                var userId = _userContextService.GetUserId();
                var result = await _collectionService.UnarchiveAsync(id, userId);
                if (!result)
                {
                    return NotFound(new ProblemDetails
                    {
                        Title = "Collection not found",
                        Detail = "The requested collection does not exist or you don't have access to it",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "Collection not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }
    }
}
