using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TenXCards.Api.Data;
using TenXCards.Api.DTOs;
using TenXCards.Api.Models;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;
using Duende.IdentityServer;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Services;

namespace TenXCards.Api.Features.Auth;

public static class StringExtensions
{
    public static string Sha256(this string input)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request);
    Task<AuthResponse> GetIdentityServerToken(string clientId, string clientSecret);
}

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;
    private readonly ITokenService _tokenService;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        ITokenService tokenService,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _tokenService = tokenService;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new InvalidOperationException("Email is already registered");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BC.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        return new AuthResponse
        {
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email }
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BC.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password");
        }

        var token = GenerateJwtToken(user);
        return new AuthResponse
        {
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email }
        };
    }

    public async Task<AuthResponse> GetIdentityServerToken(string clientId, string clientSecret)
    {
        // Validate client credentials
        var client = IdentityServerConfig.Clients.FirstOrDefault(c =>
            c.ClientId == clientId &&
            c.ClientSecrets.Any(s => s.Value == clientSecret.Sha256()));

        if (client == null)
        {
            throw new InvalidOperationException("Invalid client credentials");
        }

        // Create token with appropriate claims and scopes
        var token = GenerateJwtToken(new User { Id = Guid.Empty, Email = clientId });

        return new AuthResponse
        {
            Token = token,
            User = new UserDto { Id = Guid.Empty, Email = clientId }
        };
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            // Return true to prevent email enumeration
            return true;
        }

        user.ResetToken = GenerateResetToken();
        user.ResetTokenExpires = DateTime.UtcNow.AddHours(24);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // TODO: Send email with reset token
        _logger.LogInformation("Password reset token for {Email}: {Token}", user.Email, user.ResetToken);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.ResetToken == request.Token && u.ResetTokenExpires > DateTime.UtcNow);

        if (user == null)
        {
            throw new InvalidOperationException("Invalid or expired reset token");
        }

        user.PasswordHash = BC.HashPassword(request.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpires = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured")));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("scope", "tenxcards.api tenxcards.read tenxcards.write")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateResetToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
} 