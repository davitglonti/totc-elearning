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

public class SubscribeRequestDto
{
    public string Plan { get; set; } = "Pro"; // "Pro" or "Enterprise"
    public string BillingCycle { get; set; } = "monthly"; // "monthly" or "annual"
    public string? PaymentMethod { get; set; } = "card";
    public string? PaymentSessionId { get; set; } // Verified paid checkout transaction ID
}

public class SubscribeResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public UserProfileDto User { get; set; } = null!;
    public int UnlockedCoursesCount { get; set; }
}
