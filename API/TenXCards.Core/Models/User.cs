using System;

namespace TenXCards.Core.Models;

public class User
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; } // Stored as bcrypt hash
    public string? ApiModelKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 