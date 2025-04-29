using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TenXCards.Core.DTOs;
using TenXCards.Core.Models;
using TenXCards.Core.Repositories;
using TenXCards.Core.Services;
using TenXCards.Infrastructure.Data;

namespace TenXCards.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        ApplicationDbContext context,
        IUserRepository userRepository,
        IPasswordHashService passwordHashService,
        IJwtTokenService jwtTokenService,
        ILogger<UserService> logger)
    {
        _context = context;
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
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Password = _passwordHashService.HashPassword(request.Password),
            ApiModelKey = string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenService.GenerateToken(user);

        return new UserRegistrationResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
            Token = token,
            ExpiresIn = 604800 // 7 days in seconds
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

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<bool> ValidatePasswordAsync(User user, string password)
    {
        return _passwordHashService.VerifyPassword(password, user.Password);
    }

    public async Task<User> UpdateUserAsync(Guid id, string email, string? password = null)
    {
        var user = await GetUserByIdAsync(id);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        user.Email = email;
        if (password != null)
        {
            user.Password = _passwordHashService.HashPassword(password);
        }

        await _context.SaveChangesAsync();
        return user;
    }

    public async Task DeleteUserAsync(Guid id)
    {
        var user = await GetUserByIdAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
} 