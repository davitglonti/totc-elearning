using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for managing Pro and Enterprise subscriptions granting universal course access.
/// </summary>
[Authorize]
public class SubscriptionsController : BaseApiController
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    /// <summary>
    /// Purchase/Activate a subscription (Pro / Enterprise).
    /// Requires a verified paid checkout session. Direct unpaid activation is blocked.
    /// </summary>
    [HttpPost("subscribe")]
    [ProducesResponseType(typeof(SubscribeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var response = await _subscriptionService.SubscribeAsync(CurrentUserId.Value, dto);
            return Ok(response);
        }
        catch (SubscriptionPaymentRequiredException ex)
        {
            return BadRequest(new
            {
                success = false,
                requiresPayment = true,
                orderId = ex.OrderId,
                transactionId = ex.TransactionId,
                amount = ex.Amount,
                checkoutUrl = ex.CheckoutUrl,
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status402PaymentRequired, new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancel the active subscription.
    /// </summary>
    [HttpPost("cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            await _subscriptionService.CancelSubscriptionAsync(CurrentUserId.Value);
            return Ok(new { success = true, message = "Subscription successfully cancelled." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check current subscription status.
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(SubscriptionStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var status = await _subscriptionService.GetSubscriptionStatusAsync(CurrentUserId.Value);
            return Ok(status);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
