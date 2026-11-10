using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements checkout order creation and payment webhook handling.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly ElearningDbContext _context;
    private readonly IEnrollmentService _enrollmentService;

    public PaymentService(ElearningDbContext context, IEnrollmentService enrollmentService)
    {
        _context = context;
        _enrollmentService = enrollmentService;
    }

    public async Task<CheckoutResponseDto> CreateCheckoutSessionAsync(Guid userId, CheckoutRequestDto dto)
    {
        var course = await _context.Courses.FindAsync(dto.CourseId);
        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == dto.CourseId);
        if (alreadyEnrolled)
            throw new InvalidOperationException("You are already enrolled in this course.");

        var amount = course.Price;

        // Apply promo code discount (e.g. 20% off for TOTC)
        if (!string.IsNullOrWhiteSpace(dto.CouponCode) &&
            (dto.CouponCode.Trim().ToLower() == "totc" || dto.CouponCode.Trim().ToLower() == "totc2026"))
        {
            amount = Math.Max(0, amount - (amount * 0.20m));
        }

        var transactionId = $"txn_{Guid.NewGuid():N}";

        var order = new Order
        {
            UserId = userId,
            CourseId = dto.CourseId,
            Amount = amount,
            Currency = "USD",
            PaymentStatus = PaymentStatus.Pending,
            TransactionId = transactionId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return new CheckoutResponseDto
        {
            OrderId = order.Id,
            Amount = order.Amount,
            Currency = order.Currency,
            Status = order.PaymentStatus.ToString(),
            TransactionId = transactionId,
            CheckoutUrl = $"/checkout/session/{transactionId}"
        };
    }

    public async Task<bool> HandlePaymentWebhookAsync(PaymentWebhookDto dto)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.TransactionId == dto.TransactionId);
        if (order == null)
            return false;

        if (order.PaymentStatus == PaymentStatus.Paid)
            return true; // Already processed idempotent webhook

        if (dto.Status.Equals("Paid", StringComparison.OrdinalIgnoreCase) ||
            dto.EventType.Equals("payment.succeeded", StringComparison.OrdinalIgnoreCase))
        {
            order.PaymentStatus = PaymentStatus.Paid;

            // Automatically grant enrollment to user if order is for a specific course
            if (order.CourseId.HasValue)
            {
                await _enrollmentService.EnrollUserAsync(order.UserId, order.CourseId.Value);
            }
            await _context.SaveChangesAsync();
            return true;
        }

        order.PaymentStatus = PaymentStatus.Failed;
        await _context.SaveChangesAsync();
        return false;
    }
}
