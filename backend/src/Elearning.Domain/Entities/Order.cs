using Elearning.Domain.Enums;

namespace Elearning.Domain.Entities;

/// <summary>
/// Financial order and payment record for course enrollment.
/// </summary>
public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
