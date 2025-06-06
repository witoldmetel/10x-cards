using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TenXCards.Core.DTOs;

public record UserDto
{
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string? ApiModelKey { get; init; }
}

public record UserRegistrationRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [Required]
    [MinLength(2)]
    public string Name { get; init; } = string.Empty;
}

public record UserLoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}

public record UpdateUserRequest
{
    [Required]
    [MinLength(2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    public string? ApiModelKey { get; init; }
}

public record UpdatePasswordRequest
{
    [Required]
    public string CurrentPassword { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; init; } = string.Empty;
}

public record PasswordResetRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; init; } = string.Empty;
}

public record UserRegistrationResponse
{
    public UserDto User { get; init; } = null!;
    public string Token { get; init; } = string.Empty;
}

public record UserLoginResponse
{
    public UserDto User { get; init; } = null!;
    public string Token { get; init; } = string.Empty;
}

public record PasswordResetResponse
{
    public string Message { get; init; } = string.Empty;
}

public record PasswordResetResult
{
    public bool Success { get; init; }
    public IEnumerable<string>? Errors { get; init; }
} 