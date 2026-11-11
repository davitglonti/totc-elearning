using Elearning.Domain.Enums;

namespace Elearning.Application.DTOs;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalInstructors { get; set; }
    public int TotalStudents { get; set; }
    public int ProSubscribers { get; set; }
    public int TotalCourses { get; set; }
    public int PublishedCourses { get; set; }
    public int TotalEnrollments { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public string DbEngine { get; set; } = "SQLite (Clean Architecture)";
    public string ServerStatus { get; set; } = "Healthy (200 OK)";
    public DateTime ServerTime { get; set; } = DateTime.UtcNow;
}

public class AdminUserListItemDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsSubscribed { get; set; }
    public string? SubscriptionPlan { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AuthoredCoursesCount { get; set; }
    public int EnrollmentsCount { get; set; }
}

public class UpdateUserRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class AdminCourseListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorEmail { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Level { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public int StudentsCount { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminOrderListItemDto
{
    public Guid Id { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string ItemTitle { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentStatus { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
}
