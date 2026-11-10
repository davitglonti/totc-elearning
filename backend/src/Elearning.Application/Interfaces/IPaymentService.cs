using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing checkout sessions, orders, and payment webhook callbacks.
/// </summary>
public interface IPaymentService
{
    Task<CheckoutResponseDto> CreateCheckoutSessionAsync(Guid userId, CheckoutRequestDto dto);
    Task<bool> HandlePaymentWebhookAsync(PaymentWebhookDto dto);
}
