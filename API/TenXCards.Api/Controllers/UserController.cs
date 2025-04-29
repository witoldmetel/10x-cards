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
        [ProducesResponseType(typeof(UserRegistrationResponse), 201)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto registerDto)
        {
            var result = await _userService.RegisterUserAsync(registerDto);
            if (!result.Success)
                return BadRequest(result.Errors);
            return CreatedAtAction(nameof(Register), new { id = result.User.Id }, result.User);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(UserLoginResponse), 200)]
        [ProducesResponseType(typeof(object), 401)]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginDto)
        {
            var tokenResult = await _userService.LoginUserAsync(loginDto);
            if (!tokenResult.Success)
                return Unauthorized(tokenResult.Errors);
            return Ok(tokenResult);
        }

        [HttpPost("password-reset")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(object), 400)]
        public async Task<IActionResult> PasswordReset([FromBody] PasswordResetDto resetDto)
        {
            var result = await _userService.ResetPasswordAsync(resetDto);
            if (!result.Success)
                return BadRequest(result.Errors);
            return Ok(result);
        }
    }
}
