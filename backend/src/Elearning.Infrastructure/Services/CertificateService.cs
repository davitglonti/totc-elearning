using System.Security.Cryptography;
using System.Text;
using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements certificate issuance, retrieval, and public verification for accredited course completion.
/// </summary>
public class CertificateService : ICertificateService
{
    private readonly ElearningDbContext _context;

    public CertificateService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<List<CertificateDto>> GetUserCertificatesAsync(Guid userId)
    {
        var certificates = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();

        return certificates.Select(MapToDto).ToList();
    }

    public async Task<CertificateDto?> GetCertificateByIdAsync(Guid certificateId, Guid userId)
    {
        var certificate = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == certificateId && c.UserId == userId);

        return certificate != null ? MapToDto(certificate) : null;
    }

    public async Task<CertificateVerificationDto> VerifyCertificateAsync(string verificationHash)
    {
        if (string.IsNullOrWhiteSpace(verificationHash))
        {
            return new CertificateVerificationDto
            {
                IsValid = false,
                Message = "Verification hash is required."
            };
        }

        var cleanHash = verificationHash.Trim().ToLowerInvariant();

        var certificate = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.VerificationHash.ToLower() == cleanHash || c.CertificateNumber.ToLower() == cleanHash);

        if (certificate == null)
        {
            return new CertificateVerificationDto
            {
                IsValid = false,
                VerificationHash = verificationHash,
                Message = "Certificate not found. The verification hash is invalid or revoked."
            };
        }

        return new CertificateVerificationDto
        {
            IsValid = true,
            CertificateNumber = certificate.CertificateNumber,
            StudentName = certificate.User?.FullName ?? "Verified Student",
            CourseTitle = certificate.Course?.Title ?? "Verified Course",
            InstructorName = certificate.Course?.Instructor?.FullName ?? "TOTC Faculty",
            IssuedAt = certificate.IssuedAt,
            VerificationHash = certificate.VerificationHash,
            Message = "Certificate authenticity verified successfully by TOTC Education Authority."
        };
    }

    public async Task<CertificateDto> IssueCertificateAsync(Guid userId, Guid courseId)
    {
        // 1. Check if certificate already issued
        var existing = await _context.Certificates
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId);

        if (existing != null)
        {
            return MapToDto(existing);
        }

        // 2. Validate course and user existence
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        var course = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Sections).ThenInclude(s => s.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) throw new KeyNotFoundException("Course not found.");

        // 3. Verify course completion
        var allLessonIds = course.Sections.SelectMany(s => s.Lessons).Select(l => l.Id).ToList();
        if (allLessonIds.Count > 0)
        {
            var completedCount = await _context.LessonProgresses
                .CountAsync(lp => lp.UserId == userId && lp.IsCompleted && allLessonIds.Contains(lp.LessonId));

            if (completedCount < allLessonIds.Count)
            {
                throw new InvalidOperationException($"Cannot issue certificate: only {completedCount} of {allLessonIds.Count} lessons completed.");
            }
        }

        // 4. Generate unique serial number and cryptographic verification hash
        var serialNumber = $"TOTC-2026-{Guid.NewGuid():N}"[..17].ToUpperInvariant();
        var rawHashPayload = $"{userId:N}:{courseId:N}:{serialNumber}:{DateTime.UtcNow:O}";
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawHashPayload));
        var verificationHash = Convert.ToHexString(hashBytes).ToLowerInvariant()[..32];

        var certificate = new Certificate
        {
            UserId = userId,
            CourseId = courseId,
            CertificateNumber = serialNumber,
            VerificationHash = verificationHash,
            IssuedAt = DateTime.UtcNow,
            PdfUrl = $"/api/certificates/{serialNumber}/download"
        };

        _context.Certificates.Add(certificate);

        // 5. Ensure enrollment record is marked completed
        var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (enrollment != null && !enrollment.IsCompleted)
        {
            enrollment.IsCompleted = true;
            enrollment.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        certificate.User = user;
        certificate.Course = course;

        return MapToDto(certificate);
    }

    private static CertificateDto MapToDto(Certificate c)
    {
        return new CertificateDto
        {
            Id = c.Id,
            CourseId = c.CourseId,
            CourseTitle = c.Course?.Title ?? "Course Completion",
            UserId = c.UserId,
            StudentName = c.User?.FullName ?? "Student",
            InstructorName = c.Course?.Instructor?.FullName ?? "Instructor",
            CertificateNumber = c.CertificateNumber,
            VerificationHash = c.VerificationHash,
            IssuedAt = c.IssuedAt,
            PdfUrl = c.PdfUrl,
            VerificationUrl = $"/verify/certificate/{c.VerificationHash}"
        };
    }
}
