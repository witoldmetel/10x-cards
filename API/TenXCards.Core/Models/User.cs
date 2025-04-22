using System;

namespace TenXCards.Core.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Stored as bcrypt hash
    public string ApiKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
} 