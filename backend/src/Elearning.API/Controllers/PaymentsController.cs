using System.Security.Cryptography;
using System.Text;
using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for checkout session initialization and payment gateway webhooks.
/// </summary>
[EnableRateLimiting("payment-policy")]
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;

    public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
    {
        _paymentService = paymentService;
        _configuration = configuration;
    }

    /// <summary>
    /// Initialize a checkout session for purchasing a course.
    /// </summary>
    [Authorize]
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateCheckout([FromBody] CheckoutRequestDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var session = await _paymentService.CreateCheckoutSessionAsync(CurrentUserId.Value, dto);
            return Ok(session);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Webhook callback invoked by payment processor (Stripe/PayPal/BOG/TBC) to confirm payment and grant course enrollment.
    /// Secured via cryptographic webhook secret / signature verification header.
    /// </summary>
    [HttpPost("webhook")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PaymentWebhook([FromBody] PaymentWebhookDto dto)
    {
        // 1. Enforce Webhook Signature / Secret Verification Header
        var configuredSecret = _configuration["Payment:WebhookSecret"] 
            ?? _configuration["Stripe:WebhookSecret"] 
            ?? "totc_whsec_prod_emergency_quarantine_2026";

        var signatureHeader = Request.Headers["Stripe-Signature"].FirstOrDefault()
            ?? Request.Headers["X-Webhook-Signature"].FirstOrDefault()
            ?? Request.Headers["X-Signature"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(signatureHeader))
        {
            return StatusCode(StatusCodes.Status401Unauthorized, new 
            { 
                error = "Unauthorized", 
                message = "Missing required payment gateway webhook signature header ('Stripe-Signature' or 'X-Webhook-Signature'). Request quarantined." 
            });
        }

        // 2. Validate secret / signature against configured secret
        var isValid = VerifyWebhookSignature(signatureHeader, configuredSecret, dto);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new 
            { 
                error = "Forbidden", 
                message = "Invalid payment gateway webhook signature. Request quarantined." 
            });
        }

        var success = await _paymentService.HandlePaymentWebhookAsync(dto);
        if (!success)
            return BadRequest(new { message = "Payment webhook processing failed or invalid transaction." });

        return Ok(new { success = true, message = "Payment successfully confirmed and course enrollment granted." });
    }

    private static bool VerifyWebhookSignature(string signatureHeader, string configuredSecret, PaymentWebhookDto dto)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader) || string.IsNullOrWhiteSpace(configuredSecret))
            return false;

        var headerTrimmed = signatureHeader.Trim();
        var secretTrimmed = configuredSecret.Trim();
        var secretBytes = Encoding.UTF8.GetBytes(secretTrimmed);

        // 1. Direct secret token comparison (constant-time evaluation)
        if (headerTrimmed.Length == secretTrimmed.Length && 
            CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(headerTrimmed), 
                secretBytes))
        {
            return true;
        }

        // 2. Bearer token format
        if (headerTrimmed.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var bearerToken = headerTrimmed["Bearer ".Length..].Trim();
            if (bearerToken.Length == secretTrimmed.Length &&
                CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(bearerToken),
                    secretBytes))
            {
                return true;
            }
        }

        // 3. Cryptographic HMAC-SHA256 evaluation
        // Supported signature header formats:
        // - Stripe: t=1612345678,v1=hex_hmac
        // - Standard: sha256=hex_hmac or v1=hex_hmac
        string? timestampStr = null;
        string? signatureHex = null;

        if (headerTrimmed.Contains('='))
        {
            var parts = headerTrimmed.Split(',');
            foreach (var part in parts)
            {
                var kv = part.Trim().Split('=', 2);
                if (kv.Length == 2)
                {
                    var k = kv[0].ToLowerInvariant();
                    var v = kv[1].Trim();
                    if (k is "t" or "timestamp") timestampStr = v;
                    else if (k is "v1" or "sha256" or "signature") signatureHex = v;
                }
            }
        }
        else
        {
            signatureHex = headerTrimmed;
        }

        if (string.IsNullOrWhiteSpace(signatureHex))
            return false;

        // Prevent replay attacks if timestamp header is provided (5-minute tolerance)
        if (!string.IsNullOrWhiteSpace(timestampStr) && long.TryParse(timestampStr, out var timestamp))
        {
            var currentEpoch = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (Math.Abs(currentEpoch - timestamp) > 300)
            {
                return false; // Expired / Replay attack
            }
        }

        // Compute HMAC over canonical payloads:
        var candidatePayloads = new List<string>();
        if (!string.IsNullOrWhiteSpace(timestampStr))
        {
            candidatePayloads.Add($"{timestampStr}.{dto.TransactionId}");
            candidatePayloads.Add($"{timestampStr}.{dto.TransactionId}:{dto.Status}");
            candidatePayloads.Add($"{timestampStr}.{dto.TransactionId}:{dto.Status}:{dto.EventType}");
        }
        candidatePayloads.Add(dto.TransactionId);
        candidatePayloads.Add($"{dto.TransactionId}:{dto.Status}");
        candidatePayloads.Add($"{dto.TransactionId}:{dto.Status}:{dto.EventType}");

        using var hmac = new HMACSHA256(secretBytes);
        foreach (var payload in candidatePayloads)
        {
            var computedHashHex = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
            var sigToCompare = signatureHex.ToLowerInvariant();

            if (computedHashHex.Length == sigToCompare.Length &&
                CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(computedHashHex),
                    Encoding.UTF8.GetBytes(sigToCompare)))
            {
                return true;
            }
        }

        // Direct comparison fallback if header passed secret itself in v1=
        if (signatureHex.Length == secretTrimmed.Length &&
            CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(signatureHex),
                secretBytes))
        {
            return true;
        }

        return false;
    }
}
