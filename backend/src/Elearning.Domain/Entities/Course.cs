using Elearning.Domain.Common;
using Elearning.Domain.Enums;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents an online course created by an instructor.
/// </summary>
public class Course : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public CourseLevel Level { get; set; } = CourseLevel.Beginner;
    public bool IsPublished { get; set; } = true;

    // Moderation and Admin Approval Workflow
    public string ApprovalStatus { get; set; } = "Approved"; // "Approved", "PendingApproval", "Rejected"
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }

    // Foreign keys
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }

    public Guid InstructorId { get; set; }
    public User? Instructor { get; set; }

    // Navigation properties
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}
