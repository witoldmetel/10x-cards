using Microsoft.AspNetCore.Mvc;
using TenXCards.Core.DTOs;
using TenXCards.Core.Services;
using System.Threading.Tasks;

namespace TenXCards.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        [ProducesResponseType(typeof(UserLoginResponse), 201)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> Register([FromBody] UserRegistrationRequest registerDto)
        {
            try
            {
                var response = await _userService.RegisterUserAsync(registerDto);
                return CreatedAtAction(nameof(Register), new { id = response.UserId }, response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(UserLoginResponse), 200)]
        [ProducesResponseType(typeof(object), 401)]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest loginDto)
        {
            try
            {
                var response = await _userService.LoginUserAsync(loginDto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("password-reset")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> PasswordReset([FromBody] PasswordResetRequest resetDto)
        {
            var result = await _userService.ResetPasswordAsync(resetDto);
            if (!result.Success)
                return BadRequest(result.Errors);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDataResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetUserById([FromRoute] Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();
            var response = new UserDataResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };
            return Ok(response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDataResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateUser([FromRoute] Guid id, [FromBody] UpdateUserRequest dto)
        {
            var updated = await _userService.UpdateUserAsync(id, dto);
            if (updated == null)
                return NotFound();
            var response = new UserDataResponse
            {
                Id = updated.Id,
                Name = updated.Name,
                Email = updated.Email
            };
            return Ok(response);
        }
    }
}
