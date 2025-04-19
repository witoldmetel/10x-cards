using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace TenXCards.Api.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetToken);
}

public class EmailSettings
{
    public string SmtpServer { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(
        IOptions<EmailSettings> settings,
        ILogger<EmailService> logger,
        IConfiguration configuration)
    {
        _settings = settings.Value;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken)
    {
        var clientUrl = _configuration["ClientUrl"] ?? "http://localhost:3000";
        var resetUrl = $"{clientUrl}/reset-password?token={resetToken}";

        var message = new MailMessage
        {
            From = new MailAddress(_settings.FromEmail, _settings.FromName),
            Subject = "Reset Your Password - 10x Cards",
            IsBodyHtml = true,
            Body = $@"
                <h2>Reset Your Password</h2>
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                <p><a href='{resetUrl}'>Reset Password</a></p>
                <p>If you did not request this, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>10x Cards Team</p>"
        };

        message.To.Add(email);

        using var client = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
        {
            Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
            EnableSsl = true
        };

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Password reset email sent to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
            throw new InvalidOperationException("Failed to send password reset email. Please try again later.");
        }
    }
} 