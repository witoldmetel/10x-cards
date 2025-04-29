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

    public async Task<UserLoginResponse> RegisterUserAsync(UserRegistrationRequest request)
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
            ApiModelKey = string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenService.GenerateToken(user);

        return new UserLoginResponse
        {
            UserId = user.Id,
            Token = token,
            ExpiresIn = 604800 // 7 days
        };
    }

    public async Task<UserLoginResponse> LoginUserAsync(UserLoginRequest loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        if (user == null || !_passwordHashService.VerifyPassword(loginDto.Password, user.Password))
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

    public async Task<PasswordResetResult> ResetPasswordAsync(PasswordResetRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            return new PasswordResetResult
            {
                Success = false,
                Errors = new[] { "User not found" }
            };
        }
        user.Password = _passwordHashService.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        return new PasswordResetResult { Success = true };
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public bool ValidatePassword(User user, string password)
    {
        return _passwordHashService.VerifyPassword(password, user.Password);
    }

    public async Task<User?> UpdateUserAsync(Guid id, UpdateUserRequest dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return null;

        user.Name = dto.Name;
        user.Email = dto.Email;
        await _userRepository.UpdateAsync(user);
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

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _userRepository.EmailExistsAsync(email);
    }

    public async Task UpdateAsync(User user)
    {
        await _userRepository.UpdateAsync(user);
    }

    public async Task<User> CreateAsync(User user)
    {
        return await _userRepository.CreateAsync(user);
    }
} 