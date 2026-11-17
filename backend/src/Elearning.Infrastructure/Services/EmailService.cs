using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using Elearning.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Service providing transactional email delivery supporting Resend, SMTP, and Console fallback modes.
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName)
    {
        var provider = (_configuration["Email:Provider"]
            ?? _configuration["Email__Provider"]
            ?? Environment.GetEnvironmentVariable("Email__Provider")
            ?? Environment.GetEnvironmentVariable("Email:Provider")
            ?? "Console").Trim();

        var apiKey = (_configuration["Email:ApiKey"]
            ?? _configuration["Email__ApiKey"]
            ?? Environment.GetEnvironmentVariable("Email__ApiKey")
            ?? Environment.GetEnvironmentVariable("Email:ApiKey"))?.Trim();

        var fromAddress = (_configuration["Email:FromAddress"]
            ?? _configuration["Email__FromAddress"]
            ?? Environment.GetEnvironmentVariable("Email__FromAddress")
            ?? Environment.GetEnvironmentVariable("Email:FromAddress"))?.Trim();
        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            fromAddress = "TOTC E-Learning <noreply@totc.ge>";
        }

        var frontendUrl = (_configuration["Email:FrontendUrl"]
            ?? _configuration["Email__FrontendUrl"]
            ?? Environment.GetEnvironmentVariable("Email__FrontendUrl")
            ?? Environment.GetEnvironmentVariable("Email:FrontendUrl"))?.Trim();
        if (string.IsNullOrWhiteSpace(frontendUrl))
        {
            frontendUrl = "http://localhost:5173";
        }

        var resetUrl = $"{frontendUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";
        var safeRecipientName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(recipientName) ? "მომხმარებელო" : recipientName);
        var subject = "პაროლის აღდგენა - TOTC E-Learning";
        var htmlBody = GeneratePasswordResetEmailTemplate(safeRecipientName, resetUrl);

        _logger.LogInformation("[EmailService] Initiating password reset email delivery to {Email} via provider '{Provider}'", toEmail, provider);

        try
        {
            if (provider.Equals("Resend", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    _logger.LogWarning("[EmailService] Resend provider selected but 'Email:ApiKey' is not configured. Falling back to console logging.");
                    LogConsoleFallback(toEmail, recipientName, resetUrl);
                    return;
                }

                await SendViaResendAsync(apiKey, fromAddress, toEmail, subject, htmlBody);
                _logger.LogInformation("[EmailService] Password reset email successfully dispatched via Resend to {Email}", toEmail);
                return;
            }

            if (provider.Equals("Smtp", StringComparison.OrdinalIgnoreCase))
            {
                var smtpHost = _configuration["Email:SmtpHost"]?.Trim();
                if (string.IsNullOrWhiteSpace(smtpHost))
                {
                    _logger.LogWarning("[EmailService] SMTP provider selected but 'Email:SmtpHost' is not configured. Falling back to console logging.");
                    LogConsoleFallback(toEmail, recipientName, resetUrl);
                    return;
                }

                await SendViaSmtpAsync(smtpHost, fromAddress, toEmail, subject, htmlBody);
                _logger.LogInformation("[EmailService] Password reset email successfully dispatched via SMTP to {Email}", toEmail);
                return;
            }

            // Default: Console fallback (local development / testing / unconfigured)
            LogConsoleFallback(toEmail, recipientName, resetUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailService] Failed to send password reset email to {Email} via provider {Provider}", toEmail, provider);
            // Safe fallback: Log the reset link so developer / admin can still complete testing
            LogConsoleFallback(toEmail, recipientName, resetUrl);
        }
    }

    private async Task SendViaResendAsync(string apiKey, string fromAddress, string toEmail, string subject, string htmlBody)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var payload = new
        {
            from = fromAddress,
            to = new[] { toEmail },
            subject = subject,
            html = htmlBody
        };

        var json = JsonSerializer.Serialize(payload);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Resend API rejected request with status {(int)response.StatusCode}: {errorBody}");
        }
    }

    private async Task SendViaSmtpAsync(string smtpHost, string fromAddress, string toEmail, string subject, string htmlBody)
    {
        var portStr = _configuration["Email:SmtpPort"];
        var port = int.TryParse(portStr, out var p) ? p : 587;
        var smtpUser = _configuration["Email:SmtpUser"]?.Trim();
        var smtpPassword = _configuration["Email:SmtpPassword"]?.Trim();
        var enableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var ssl) && ssl;

        using var client = new SmtpClient(smtpHost, port)
        {
            EnableSsl = enableSsl
        };

        if (!string.IsNullOrWhiteSpace(smtpUser))
        {
            client.Credentials = new NetworkCredential(smtpUser, smtpPassword ?? string.Empty);
        }

        using var message = new MailMessage(fromAddress, toEmail, subject, htmlBody)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(message);
    }

    private void LogConsoleFallback(string toEmail, string recipientName, string resetUrl)
    {
        _logger.LogInformation(
            "\n================================================================================\n" +
            "[EmailService Dev/Console Fallback]\n" +
            "Recipient: {Email} ({Name})\n" +
            "Subject: პაროლის აღდგენა - TOTC E-Learning\n" +
            "Reset Link: {ResetUrl}\n" +
            "Token Expiry: 30 minutes from generation\n" +
            "================================================================================",
            toEmail, recipientName, resetUrl);
    }

    private static string GeneratePasswordResetEmailTemplate(string recipientName, string resetUrl)
    {
        return $@"<!DOCTYPE html>
<html lang=""ka"">
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>პაროლის აღდგენა - TOTC E-Learning</title>
</head>
<body style=""font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;"">
    <table align=""center"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width: 560px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;"">
        <tr>
            <td style=""background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;"">
                <h1 style=""color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;"">TOTC E-Learning</h1>
                <p style=""color: #e0e7ff; margin: 6px 0 0; font-size: 14px;"">სასწავლო პლატფორმა</p>
            </td>
        </tr>
        <tr>
            <td style=""padding: 32px 28px;"">
                <h2 style=""color: #1e293b; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;"">გამარჯობა, {recipientName}!</h2>
                <p style=""color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;"">
                    მივიღეთ თქვენი ანგარიშის პაროლის აღდგენის მოთხოვნა. პაროლის შესაცვლელად და ახალი პაროლის დასაყენებლად დააჭირეთ ქვემოთ მოცემულ ღილაკს:
                </p>
                <div style=""text-align: center; margin: 32px 0;"">
                    <a href=""{resetUrl}"" target=""_blank"" style=""background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);"">
                        პაროლის შეცვლა
                    </a>
                </div>
                <div style=""background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;"">
                    <p style=""color: #334155; font-size: 13px; margin: 0; line-height: 1.5;"">
                        ⏰ აღნიშნული ბმული აქტიურია <strong>30 წუთის</strong> განმავლობაში და მისი გამოყენება შესაძლებელია მხოლოდ ერთხელ.
                    </p>
                </div>
                <p style=""color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 24px;"">
                    თუ პაროლის აღდგენა თქვენ არ მოგითხოვიათ, გთხოვთ უგულებელყოთ ეს წერილი. თქვენი ანგარიში რჩება სრულიად დაცული.
                </p>
                <hr style=""border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;"">
                <p style=""color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; word-break: break-all;"">
                    თუ ღილაკზე დაჭერა ვერ ხერხდება, დააკოპირეთ შემდეგი ბმული თქვენს ბრაუზერში:<br>
                    <a href=""{resetUrl}"" style=""color: #4f46e5; text-decoration: underline;"">{resetUrl}</a>
                </p>
            </td>
        </tr>
        <tr>
            <td style=""background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;"">
                <p style=""color: #94a3b8; font-size: 12px; margin: 0;"">
                    &copy; {DateTime.UtcNow.Year} TOTC E-Learning. ყველა უფლება დაცულია.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
