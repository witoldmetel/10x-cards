using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;
using System.Threading.Tasks;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(UserRegistrationResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserRegistrationResponse>> Register([FromBody] UserRegistrationRequest request)
        {
            try
            {
                var response = await _userService.RegisterUserAsync(request);
                return CreatedAtAction(nameof(GetUserData), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Registration failed",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(UserLoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<UserLoginResponse>> Login([FromBody] UserLoginRequest request)
        {
            try
            {
                var response = await _userService.LoginUserAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new ProblemDetails
                {
                    Title = "Login failed",
                    Detail = ex.Message,
                    Status = StatusCodes.Status401Unauthorized
                });
            }
        }

        /// <summary>
        /// Reset user password
        /// </summary>
        [HttpPost("password-reset")]
        [ProducesResponseType(typeof(PasswordResetResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PasswordResetResponse>> ResetPassword([FromBody] PasswordResetRequest request)
        {
            try
            {
                var response = await _userService.ResetPasswordAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Password reset failed",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        /// <summary>
        /// Get user data by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDataResponse>> GetUserData([FromRoute] Guid id)
        {
            try
            {
                var response = await _userService.GetUserDataAsync(id);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "User not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }

        /// <summary>
        /// Update user data
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(UserDataResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDataResponse>> UpdateUser([FromRoute] Guid id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var response = await _userService.UpdateUserAsync(id, request);
                return Ok(response);
            }
            catch (Exception ex) when (ex.Message == "User not found")
            {
                return NotFound(new ProblemDetails
                {
                    Title = "User not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Update failed",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        /// <summary>
        /// Delete user account
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteUser([FromRoute] Guid id)
        {
            try
            {
                await _userService.DeleteUserAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(new ProblemDetails
                {
                    Title = "User not found",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
        }
    }
}
