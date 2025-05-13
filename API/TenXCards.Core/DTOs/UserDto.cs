using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TenXCards.Core.DTOs;

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
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string Token { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
}

public record UserLoginResponse
{
    public Guid UserId { get; init; }
    public string Token { get; init; } = string.Empty;
    public int ExpiresIn { get; init; }
}

public record UserDataResponse
{
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string? ApiModelKey { get; init; }
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