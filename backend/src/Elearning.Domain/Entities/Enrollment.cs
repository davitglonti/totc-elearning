using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents a student's enrollment in a course.
/// </summary>
public class Enrollment : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
}
