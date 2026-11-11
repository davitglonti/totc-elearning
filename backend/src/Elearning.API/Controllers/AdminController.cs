using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers;

/// <summary>
/// Dedicated administrator management endpoints for real system telemetry,
/// user roles, course catalog publishing, and financial transaction records.
/// </summary>
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController : BaseApiController
{
    private readonly ElearningDbContext _context;

    public AdminController(ElearningDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retrieve real-time operational statistics and system health telemetry.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalInstructors = await _context.Users.CountAsync(u => u.Role == UserRole.Instructor);
        var totalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student);
        var proSubscribers = await _context.Users.CountAsync(u => u.IsSubscribed);
        var totalCourses = await _context.Courses.CountAsync();
        var publishedCourses = await _context.Courses.CountAsync(c => c.IsPublished);
        var totalEnrollments = await _context.Enrollments.CountAsync();
        var totalRevenue = await _context.Orders
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => (decimal?)o.Amount) ?? 0m;
        var totalOrders = await _context.Orders.CountAsync();

        var stats = new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalInstructors = totalInstructors,
            TotalStudents = totalStudents,
            ProSubscribers = proSubscribers,
            TotalCourses = totalCourses,
            PublishedCourses = publishedCourses,
            TotalEnrollments = totalEnrollments,
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            DbEngine = "SQLite (Clean Architecture)",
            ServerStatus = "Healthy (200 OK)",
            ServerTime = DateTime.UtcNow
        };

        return Ok(stats);
    }

    /// <summary>
    /// Retrieve full list of platform users with roles and enrollment counts.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<AdminUserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Include(u => u.AuthoredCourses)
            .Include(u => u.Enrollments)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsSubscribed = u.IsSubscribed,
                SubscriptionPlan = u.SubscriptionPlan,
                SubscriptionExpiresAt = u.SubscriptionExpiresAt,
                AvatarUrl = u.AvatarUrl,
                CreatedAt = u.CreatedAt,
                AuthoredCoursesCount = u.AuthoredCourses.Count,
                EnrollmentsCount = u.Enrollments.Count
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Update a user's platform authorization role.
    /// </summary>
    [HttpPut("users/{id:guid}/role")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (!Enum.TryParse<UserRole>(dto.Role, true, out var parsedRole))
        {
            return BadRequest(new { message = $"Invalid role '{dto.Role}'. Valid roles: Student, Instructor, Admin." });
        }

        user.Role = parsedRole;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"User role updated to {parsedRole} successfully.", user.Id, Role = parsedRole.ToString() });
    }

    /// <summary>
    /// Delete a platform user account (protected against self-deletion).
    /// </summary>
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (CurrentUserId.HasValue && CurrentUserId.Value == id)
        {
            return BadRequest(new { message = "You cannot delete your own administrator account." });
        }

        var user = await _context.Users
            .Include(u => u.Enrollments)
            .Include(u => u.LessonProgresses)
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound(new { message = "User not found." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully." });
    }

    /// <summary>
    /// Retrieve full course catalog for administrator inspection and publishing control.
    /// </summary>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(List<AdminCourseListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AdminCourseListItemDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                CategoryName = c.Category != null ? c.Category.Name : "Uncategorized",
                InstructorName = c.Instructor != null ? c.Instructor.FullName : "Unknown",
                InstructorEmail = c.Instructor != null ? c.Instructor.Email : "",
                Price = c.Price,
                Level = c.Level.ToString(),
                IsPublished = c.IsPublished,
                StudentsCount = c.Enrollments.Count,
                ThumbnailUrl = c.ThumbnailUrl,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(courses);
    }

    /// <summary>
    /// Toggle course publish/unpublish visibility state.
    /// </summary>
    [HttpPut("courses/{id:guid}/toggle-publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleCoursePublish(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Course not found." });

        course.IsPublished = !course.IsPublished;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Course is now {(course.IsPublished ? "Published" : "Hidden (Draft)")}.", course.Id, course.IsPublished });
    }

    /// <summary>
    /// Delete course from catalog.
    /// </summary>
    [HttpDelete("courses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                    .ThenInclude(l => l.Quiz)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Course deleted successfully." });
    }

    /// <summary>
    /// Retrieve full history of financial orders, checkout transactions, and subscriptions.
    /// </summary>
    [HttpGet("orders")]
    [ProducesResponseType(typeof(List<AdminOrderListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Course)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new AdminOrderListItemDto
            {
                Id = o.Id,
                UserFullName = o.User != null ? o.User.FullName : "Unknown",
                UserEmail = o.User != null ? o.User.Email : "Unknown",
                ItemTitle = o.Course != null ? o.Course.Title : (o.OrderType ?? "Subscription"),
                OrderType = o.OrderType ?? "Purchase",
                Amount = o.Amount,
                Currency = o.Currency,
                PaymentStatus = o.PaymentStatus.ToString(),
                TransactionId = o.TransactionId,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        return Ok(orders);
    }
}
