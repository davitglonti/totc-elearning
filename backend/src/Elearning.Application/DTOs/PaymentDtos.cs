namespace Elearning.Application.DTOs;

public class CheckoutRequestDto
{
    public Guid CourseId { get; set; }
    public string? CouponCode { get; set; }
    public string PaymentProvider { get; set; } = "stripe"; // "stripe", "bog", "tbc"
}

public class CheckoutResponseDto
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string Status { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
}

public class PaymentWebhookDto
{
    public string TransactionId { get; set; } = string.Empty;
    public string EventType { get; set; } = "payment.succeeded";
    public string Status { get; set; } = "Paid";
}
