using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements subscription management, checkout session initiation, and plan activation.
/// </summary>
public class SubscriptionService : ISubscriptionService
{
    private readonly ElearningDbContext _context;

    public SubscriptionService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<SubscribeResponseDto> SubscribeAsync(Guid userId, SubscribeRequestDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        var plan = string.IsNullOrWhiteSpace(dto.Plan) ? "Pro" : dto.Plan.Trim();
        var isAnnual = dto.BillingCycle?.Trim().ToLower() == "annual";
        var amount = isAnnual ? 190.00m : 19.00m;

        // Block direct unpaid self-activation: mandate verified payment session
        if (string.IsNullOrWhiteSpace(dto.PaymentSessionId))
        {
            var pendingTransactionId = $"sub_{Guid.NewGuid():N}";
            var pendingOrder = new Order
            {
                UserId = user.Id,
                CourseId = null,
                OrderType = "Subscription",
                Amount = amount,
                Currency = "USD",
                PaymentStatus = PaymentStatus.Pending,
                TransactionId = pendingTransactionId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Orders.Add(pendingOrder);
            await _context.SaveChangesAsync();

            throw new SubscriptionPaymentRequiredException(
                "Direct subscription self-activation without payment is prohibited. Please complete payment via checkout session.",
                pendingOrder.Id,
                pendingTransactionId,
                pendingOrder.Amount,
                $"/checkout/session/{pendingTransactionId}");
        }

        // Validate the payment session order
        var paidOrder = await _context.Orders.FirstOrDefaultAsync(o =>
            o.TransactionId == dto.PaymentSessionId &&
            o.UserId == user.Id &&
            o.OrderType == "Subscription");

        if (paidOrder == null || paidOrder.PaymentStatus != PaymentStatus.Paid)
        {
            throw new UnauthorizedAccessException("Invalid or unpaid subscription payment session. Subscription activation requires a verified paid order.");
        }

        var expiresAt = DateTime.UtcNow.AddMonths(isAnnual ? 12 : 1);

        // 1. Update user subscription state
        user.IsSubscribed = true;
        user.SubscriptionPlan = plan;
        user.SubscriptionExpiresAt = expiresAt;

        // 2. Count published courses for feedback
        var publishedCoursesCount = await _context.Courses
            .CountAsync(c => c.IsPublished);

        await _context.SaveChangesAsync();

        var userProfile = new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            IsSubscribed = true,
            SubscriptionPlan = plan,
            SubscriptionExpiresAt = expiresAt,
            CreatedAt = user.CreatedAt
        };

        return new SubscribeResponseDto
        {
            Success = true,
            Message = $"🎉 Congratulations! Your {plan} subscription is active. All {publishedCoursesCount} courses are now fully unlocked!",
            Plan = plan,
            ExpiresAt = expiresAt,
            User = userProfile,
            UnlockedCoursesCount = publishedCoursesCount
        };
    }

    public async Task<bool> CancelSubscriptionAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        user.IsSubscribed = false;
        user.SubscriptionPlan = "None";
        user.SubscriptionExpiresAt = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new KeyNotFoundException("User not found.");

        var isActive = user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);

        return new SubscriptionStatusDto
        {
            IsSubscribed = isActive,
            Plan = user.SubscriptionPlan ?? "None",
            ExpiresAt = user.SubscriptionExpiresAt
        };
    }
}
