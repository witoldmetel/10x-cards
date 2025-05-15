using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;
using BC = BCrypt.Net.BCrypt;

namespace TenXCards.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;

    public UserService(
        IUserRepository userRepository,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<UserRegistrationResponse> RegisterUserAsync(UserRegistrationRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            Email = request.Email,
            Password = _passwordHashService.HashPassword(request.Password),
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        var token = _jwtTokenService.GenerateToken(user);

        return new UserRegistrationResponse
        {
            User = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                ApiModelKey = user.ApiModelKey
            },
            Token = token
        };
    }

    public async Task<UserLoginResponse> LoginUserAsync(UserLoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null || !_passwordHashService.VerifyPassword(request.Password, user.Password))
        {
            throw new Exception("Invalid email or password");
        }

        var token = _jwtTokenService.GenerateToken(user);
        
        return new UserLoginResponse
        {
            User = new UserDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                ApiModelKey = user.ApiModelKey
            },
            Token = token,

        };
    }

    public async Task<PasswordResetResponse> ResetPasswordAsync(PasswordResetRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        user.Password = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return new PasswordResetResponse
        {
            Message = "Password has been reset successfully"
        };
    }

    public async Task<UserDto> GetUserDataAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        return new UserDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            ApiModelKey = user.ApiModelKey
        };
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        // Check if email is being changed and if it already exists
        if (user.Email != request.Email && await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new Exception("Email already exists");
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.ApiModelKey = request.ApiModelKey;

        await _userRepository.UpdateAsync(user);

        return new UserDto
        {
            UserId = user.UserId,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            ApiModelKey = user.ApiModelKey
        };
    }

    public async Task DeleteUserAsync(Guid id)
    {
        await _userRepository.DeleteAsync(id);
    }

    public async Task<bool> ValidatePasswordAsync(Guid id, string password)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        return _passwordHashService.VerifyPassword(password, user.Password);
    }

    public async Task UpdatePasswordAsync(Guid id, UpdatePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new Exception("User not found");

        if (!_passwordHashService.VerifyPassword(request.CurrentPassword, user.Password))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.Password = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
    }
} 