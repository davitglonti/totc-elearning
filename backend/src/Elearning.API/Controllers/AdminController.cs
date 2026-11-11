using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
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
    private readonly IBunnyStreamService _bunnyService;

    public AdminController(ElearningDbContext context, IBunnyStreamService bunnyService)
    {
        _context = context;
        _bunnyService = bunnyService;
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
        var publishedCourses = await _context.Courses.CountAsync(c => c.IsPublished && c.ApprovalStatus == "Approved");
        var pendingApprovals = await _context.Courses.CountAsync(c => c.ApprovalStatus == "PendingApproval");
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
            PendingApprovals = pendingApprovals,
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
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
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
                ApprovalStatus = c.ApprovalStatus,
                RejectionReason = c.RejectionReason,
                SectionsCount = c.Sections.Count,
                LessonsCount = c.Sections.Sum(s => s.Lessons.Count),
                StudentsCount = c.Enrollments.Count,
                ThumbnailUrl = c.ThumbnailUrl,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(courses);
    }

    /// <summary>
    /// Retrieve complete curriculum of a course for administrator audit and review.
    /// </summary>
    [HttpGet("courses/{id:guid}/review")]
    [ProducesResponseType(typeof(AdminCourseReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseReview(Guid id)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        var reviewDto = new AdminCourseReviewDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            CategoryName = course.Category != null ? course.Category.Name : "Uncategorized",
            InstructorName = course.Instructor != null ? course.Instructor.FullName : "Unknown",
            InstructorEmail = course.Instructor != null ? course.Instructor.Email : "",
            Price = course.Price,
            Level = course.Level.ToString(),
            IsPublished = course.IsPublished,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            SectionsCount = course.Sections.Count,
            LessonsCount = course.Sections.Sum(s => s.Lessons.Count),
            StudentsCount = course.Enrollments.Count,
            ThumbnailUrl = course.ThumbnailUrl,
            CreatedAt = course.CreatedAt,
            Sections = course.Sections.OrderBy(s => s.OrderIndex).Select(s => new SectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.OrderBy(l => l.OrderIndex).Select(l => new LessonDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    VideoUrl = l.VideoUrl,
                    DurationMinutes = l.DurationMinutes,
                    ContentText = l.ContentText,
                    IsFreePreview = l.IsFreePreview,
                    OrderIndex = l.OrderIndex
                }).ToList()
            }).ToList()
        };

        return Ok(reviewDto);
    }

    /// <summary>
    /// Approve an instructor's pending course and publish it live to the LMS catalog.
    /// </summary>
    [HttpPut("courses/{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveCourse(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Course not found." });

        course.ApprovalStatus = "Approved";
        course.IsPublished = true;
        course.ApprovedAt = DateTime.UtcNow;
        course.RejectionReason = null;

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = $"Course '{course.Title}' approved and successfully published to the TOTC LMS catalog!", 
            course.Id, 
            course.ApprovalStatus, 
            course.IsPublished 
        });
    }

    /// <summary>
    /// Reject an instructor's course and request curriculum revisions.
    /// </summary>
    [HttpPut("courses/{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectCourse(Guid id, [FromBody] RejectCourseDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Course not found." });

        course.ApprovalStatus = "Rejected";
        course.IsPublished = false;
        course.RejectionReason = string.IsNullOrWhiteSpace(dto.Reason) 
            ? "Requires revisions to meet curriculum quality standards." 
            : dto.Reason.Trim();

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = $"Course '{course.Title}' returned to instructor with change request.", 
            course.Id, 
            course.ApprovalStatus, 
            course.RejectionReason 
        });
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

    /// <summary>
    /// Retrieve current Bunny Stream Video CDN settings.
    /// </summary>
    [HttpGet("bunny-stream")]
    public IActionResult GetBunnyStreamSettings()
    {
        var config = _bunnyService.GetConfig();
        return Ok(config);
    }

    /// <summary>
    /// Update Bunny Stream Video CDN settings.
    /// </summary>
    [HttpPut("bunny-stream")]
    public IActionResult UpdateBunnyStreamSettings([FromBody] BunnyConfigDto dto)
    {
        _bunnyService.UpdateConfig(dto);
        return Ok(new { message = "Bunny Stream configuration updated successfully.", config = _bunnyService.GetConfig() });
    }

    /// <summary>
    /// Test live connection to Bunny Stream Video Library API.
    /// </summary>
    [HttpPost("bunny-stream/test")]
    public async Task<IActionResult> TestBunnyStreamConnection()
    {
        var result = await _bunnyService.TestConnectionAsync();
        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            totalVideos = result.TotalVideos
        });
    }
}
