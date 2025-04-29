using System;
using System.ComponentModel.DataAnnotations;

namespace TenXCards.Core.DTOs;

/// <summary>
/// Request payload for registering a new user.
/// </summary>
public record UserRegistrationRequest
{
    /// <example>john@example.com</example>
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    /// <example>StrongPassword123!</example>
    [Required]
    [MinLength(8)]
    public string Password { get; init; } = string.Empty;

    /// <example>John Doe</example>
    [Required]
    [MinLength(2)]
    public string Name { get; init; } = string.Empty;
}

/// <summary>
/// Response payload for a successful user registration.
/// </summary>
public record UserRegistrationResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string Token { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
}

/// <summary>
/// Request payload for user login.
/// </summary>
public record UserLoginRequest
{
    /// <example>john@example.com</example>
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    /// <example>StrongPassword123!</example>
    [Required]
    public string Password { get; init; } = string.Empty;
}

/// <summary>
/// Response payload for a successful user login.
/// </summary>
public record UserLoginResponse
{
    public Guid UserId { get; init; }
    public string Token { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
}

/// <summary>
/// Request payload for password reset.
/// </summary>
public record PasswordResetRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; init; } = string.Empty;
}


/// <summary>
/// Service response type for password reset.
/// </summary>
public record PasswordResetResult
{
    public bool Success { get; init; }
    public IEnumerable<string>? Errors { get; init; }
}

/// <summary>
/// Response payload for returning user data by id.
/// </summary>
public record UserDataResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}

/// <summary>
/// Request payload for updating user name and email.
/// </summary>
public class UpdateUserRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Minimal response payload for login/register.
/// </summary>
public class AuthResponse
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}