namespace Elearning.Application.Interfaces;

/// <summary>
/// Service interface for sending transactional emails (e.g., password reset, notifications).
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a password reset email containing a secure one-time reset link.
    /// </summary>
    /// <param name="toEmail">Recipient's email address.</param>
    /// <param name="resetToken">The raw, unhashed 32-byte cryptographic token.</param>
    /// <param name="recipientName">The recipient's full name for personalization.</param>
    Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName);
}
