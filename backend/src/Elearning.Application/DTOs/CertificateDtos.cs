namespace Elearning.Application.DTOs;

public class CertificateDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string CertificateNumber { get; set; } = string.Empty;
    public string VerificationHash { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public string? PdfUrl { get; set; }
    public string VerificationUrl { get; set; } = string.Empty;
}

public class CertificateVerificationDto
{
    public bool IsValid { get; set; }
    public string? CertificateNumber { get; set; }
    public string? StudentName { get; set; }
    public string? CourseTitle { get; set; }
    public string? InstructorName { get; set; }
    public DateTime? IssuedAt { get; set; }
    public string VerificationHash { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
