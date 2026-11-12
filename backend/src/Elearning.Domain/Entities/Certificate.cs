using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents an accredited certificate of course completion.
/// </summary>
public class Certificate : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public string CertificateNumber { get; set; } = string.Empty;
    public string VerificationHash { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public string? PdfUrl { get; set; }
}
