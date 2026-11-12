using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Thrown when direct subscription activation is attempted without a verified checkout payment session.
/// </summary>
public class SubscriptionPaymentRequiredException : Exception
{
    public Guid OrderId { get; }
    public string TransactionId { get; }
    public decimal Amount { get; }
    public string CheckoutUrl { get; }

    public SubscriptionPaymentRequiredException(string message, Guid orderId, string transactionId, decimal amount, string checkoutUrl) : base(message)
    {
        OrderId = orderId;
        TransactionId = transactionId;
        Amount = amount;
        CheckoutUrl = checkoutUrl;
    }
}

/// <summary>
/// Service managing student Pro/Enterprise memberships, checkout order sessions, and active statuses.
/// </summary>
public interface ISubscriptionService
{
    Task<SubscribeResponseDto> SubscribeAsync(Guid userId, SubscribeRequestDto dto);
    Task<bool> CancelSubscriptionAsync(Guid userId);
    Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(Guid userId);
}
