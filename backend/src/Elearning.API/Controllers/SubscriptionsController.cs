using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for managing Pro and Enterprise subscriptions granting universal course access.
/// </summary>
[Authorize]
public class SubscriptionsController : BaseApiController
{
    private readonly ElearningDbContext _context;

    public SubscriptionsController(ElearningDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Purchase/Activate a subscription (Pro / Enterprise) granting unlimited access to all courses.
    /// </summary>
    [HttpPost("subscribe")]
    [ProducesResponseType(typeof(SubscribeResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null) return NotFound(new { message = "User not found." });

        var plan = string.IsNullOrWhiteSpace(dto.Plan) ? "Pro" : dto.Plan.Trim();
        var isAnnual = dto.BillingCycle?.Trim().ToLower() == "annual";
        var amount = isAnnual ? 190.00m : 19.00m;
        var expiresAt = DateTime.UtcNow.AddMonths(isAnnual ? 12 : 1);

        // 1. Update user subscription state
        user.IsSubscribed = true;
        user.SubscriptionPlan = plan;
        user.SubscriptionExpiresAt = expiresAt;

        // 2. Record financial order
        var order = new Order
        {
            UserId = user.Id,
            CourseId = null,
            OrderType = "Subscription",
            Amount = amount,
            Currency = "USD",
            PaymentStatus = PaymentStatus.Paid,
            TransactionId = $"sub_{Guid.NewGuid():N}",
            CreatedAt = DateTime.UtcNow
        };
        _context.Orders.Add(order);

        // 3. Ensure user is enrolled into all published courses
        var publishedCourses = await _context.Courses
            .Where(c => c.IsPublished)
            .ToListAsync();

        var existingEnrollmentCourseIds = await _context.Enrollments
            .Where(e => e.UserId == user.Id)
            .Select(e => e.CourseId)
            .ToListAsync();

        foreach (var course in publishedCourses)
        {
            if (!existingEnrollmentCourseIds.Contains(course.Id))
            {
                _context.Enrollments.Add(new Enrollment
                {
                    UserId = user.Id,
                    CourseId = course.Id,
                    EnrolledAt = DateTime.UtcNow,
                    IsCompleted = false
                });
            }
        }

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

        return Ok(new SubscribeResponseDto
        {
            Success = true,
            Message = $"🎉 Congratulations! Your {plan} subscription is active. All {publishedCourses.Count} courses are now fully unlocked!",
            Plan = plan,
            ExpiresAt = expiresAt,
            User = userProfile,
            UnlockedCoursesCount = publishedCourses.Count
        });
    }

    /// <summary>
    /// Cancel the active subscription.
    /// </summary>
    [HttpPost("cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Cancel()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null) return NotFound(new { message = "User not found." });

        user.IsSubscribed = false;
        user.SubscriptionPlan = "None";
        user.SubscriptionExpiresAt = null;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Subscription successfully cancelled." });
    }

    /// <summary>
    /// Check current subscription status.
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null) return NotFound(new { message = "User not found." });

        var isActive = user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);

        return Ok(new
        {
            isSubscribed = isActive,
            plan = user.SubscriptionPlan ?? "None",
            expiresAt = user.SubscriptionExpiresAt
        });
    }
}
