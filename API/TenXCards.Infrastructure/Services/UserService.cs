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

    public async Task<UserRegistrationResponse> RegisterAsync(UserRegistrationRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        var user = new User
        {
            Email = request.Email,
            Password = _passwordHashService.HashPassword(request.Password),
            ApiKey = GenerateApiKey(),
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _userRepository.CreateAsync(user);

        return new UserRegistrationResponse
        {
            Id = createdUser.Id,
            Email = createdUser.Email,
            CreatedAt = createdUser.CreatedAt
        };
    }

    public async Task<UserLoginResponse> LoginAsync(UserLoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        
        if (user == null || !_passwordHashService.VerifyPassword(request.Password, user.Password))
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        var token = _jwtTokenService.GenerateToken(user);

        return new UserLoginResponse
        {
            UserId = user.Id,
            Token = token,
            ExpiresIn = 7 * 24 * 60 * 60 // 7 days in seconds
        };
    }

    private static string GenerateApiKey()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_")
            .Replace("+", "-")
            .Replace("=", "");
    }
} 