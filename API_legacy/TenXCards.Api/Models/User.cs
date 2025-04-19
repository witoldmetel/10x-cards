using System.ComponentModel.DataAnnotations;

namespace TenXCards.Api.Models;

public class User
{
    public Guid Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    // ResetToken is used for password reset functionality. When a user requests a password reset,
    // they receive a unique token via email that allows them to reset their password
    public string? ResetToken { get; set; }

    // ResetTokenExpires defines when the reset token becomes invalid for security purposes.
    // Typically tokens expire after a short period (e.g. 1 hour) to prevent unauthorized access
    public DateTime? ResetTokenExpires { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation property for user's flashcards
    public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
} 