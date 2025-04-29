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