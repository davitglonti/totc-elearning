using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for checkout session initialization and payment gateway webhooks.
/// </summary>
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
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
    /// </summary>
    [HttpPost("webhook")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> PaymentWebhook([FromBody] PaymentWebhookDto dto)
    {
        var success = await _paymentService.HandlePaymentWebhookAsync(dto);
        if (!success)
            return BadRequest(new { message = "Payment webhook processing failed or invalid transaction." });

        return Ok(new { success = true, message = "Payment successfully confirmed and course enrollment granted." });
    }
}
