using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements administrator telemetry, user account management, and course approval moderation.
/// </summary>
public class AdminService : IAdminService
{
    private readonly ElearningDbContext _context;

    public AdminService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
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

        return new AdminStatsDto
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
            DbEngine = "EF Core 9 (Enterprise Clean Architecture)",
            ServerStatus = "Healthy (200 OK)",
            ServerTime = DateTime.UtcNow
        };
    }

    public async Task<List<AdminUserListItemDto>> GetUsersAsync()
    {
        return await _context.Users
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
    }

    public async Task<bool> UpdateUserRoleAsync(Guid userId, string role)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
        {
            throw new ArgumentException($"Invalid role '{role}'. Valid roles: Student, Instructor, Admin.");
        }

        user.Role = parsedRole;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(Guid userId, Guid currentAdminId)
    {
        if (currentAdminId == userId)
        {
            throw new InvalidOperationException("You cannot delete your own administrator account.");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        // Soft delete user to preserve relational order and enrollment history
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<AdminCourseListItemDto>> GetCoursesAsync()
    {
        return await _context.Courses
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
    }

    public async Task<AdminCourseReviewDto?> GetCourseReviewAsync(Guid courseId)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return null;

        return new AdminCourseReviewDto
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
            Sections = course.Sections.Select(s => new SectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.Select(l => new LessonDto
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
    }

    public async Task<bool> ApproveCourseAsync(Guid courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) throw new KeyNotFoundException("Course not found.");

        course.ApprovalStatus = "Approved";
        course.IsPublished = true;
        course.ApprovedAt = DateTime.UtcNow;
        course.RejectionReason = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectCourseAsync(Guid courseId, string reason)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) throw new KeyNotFoundException("Course not found.");

        course.ApprovalStatus = "Rejected";
        course.IsPublished = false;
        course.RejectionReason = string.IsNullOrWhiteSpace(reason)
            ? "Requires revisions to meet curriculum quality standards."
            : reason.Trim();

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleCoursePublishAsync(Guid courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) throw new KeyNotFoundException("Course not found.");

        course.IsPublished = !course.IsPublished;
        await _context.SaveChangesAsync();
        return course.IsPublished;
    }

    public async Task<bool> DeleteCourseAsync(Guid courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) throw new KeyNotFoundException("Course not found.");

        // Soft delete course to maintain relational integrity with orders and completed enrollments
        course.IsDeleted = true;
        course.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<AdminOrderListItemDto>> GetOrdersAsync()
    {
        return await _context.Orders
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
    }
}
