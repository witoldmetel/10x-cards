using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;

namespace TenXCards.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _passwordHashService = passwordHashService;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<UserRegistrationResponse> RegisterUserAsync(UserRegistrationRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Password = _passwordHashService.HashPassword(request.Password),
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        var token = _jwtTokenService.GenerateToken(user);

        return new UserRegistrationResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            Token = token,
            ExpiresIn = 604800 // 7 days
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
            UserId = user.Id,
            Token = token,
            ExpiresIn = 604800 // 7 days
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

    public async Task<UserDataResponse> GetUserDataAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        return new UserDataResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            ApiModelKey = user.ApiModelKey
        };
    }

    public async Task<UserDataResponse> UpdateUserAsync(Guid id, UpdateUserRequest request)
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

        return new UserDataResponse
        {
            UserId = user.Id,
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
} 