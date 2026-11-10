using Elearning.Domain.Enums;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents a user account (Student, Instructor, or Admin).
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Student;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Subscription & Pro Membership
    public bool IsSubscribed { get; set; } = false;
    public string? SubscriptionPlan { get; set; } // "Pro", "Enterprise"
    public DateTime? SubscriptionExpiresAt { get; set; }

    // Navigation properties
    public ICollection<Course> AuthoredCourses { get; set; } = new List<Course>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
