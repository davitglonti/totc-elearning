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

    public async Task<CertificateDto?> GetCertificateByCourseIdAsync(Guid userId, Guid courseId)
    {
        var certificate = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId);

        return certificate != null ? MapToDto(certificate) : null;
    }

    public async Task<CertificateDto?> GetCertificateByNumberAsync(string certificateNumber)
    {
        if (string.IsNullOrWhiteSpace(certificateNumber)) return null;
        var clean = certificateNumber.Trim().ToLowerInvariant();

        var certificate = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course).ThenInclude(c => c!.Instructor)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.CertificateNumber.ToLower() == clean || c.VerificationHash.ToLower() == clean);

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

    public async Task<string?> GenerateCertificateHtmlAsync(string certificateNumber)
    {
        var cert = await GetCertificateByNumberAsync(certificateNumber);
        if (cert == null) return null;

        return GenerateCertificateHtml(cert);
    }

    private static string GenerateCertificateHtml(CertificateDto cert)
    {
        var issuedDate = cert.IssuedAt.ToString("dd MMMM, yyyy");
        var studentName = System.Net.WebUtility.HtmlEncode(cert.StudentName ?? "Student");
        var courseTitle = System.Net.WebUtility.HtmlEncode(cert.CourseTitle ?? "Course Completion");
        var instructorName = System.Net.WebUtility.HtmlEncode(cert.InstructorName ?? "Instructor");
        var certNumber = System.Net.WebUtility.HtmlEncode(cert.CertificateNumber ?? "");
        var verifyHash = System.Net.WebUtility.HtmlEncode(cert.VerificationHash ?? "");

        return $@"<!DOCTYPE html>
<html lang=""ka"">
<head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <title>TOTC Certificate - {certNumber}</title>
    <link rel=""preconnect"" href=""https://fonts.googleapis.com"">
    <link rel=""preconnect"" href=""https://fonts.gstatic.com"" crossorigin>
    <link href=""https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Poppins:wght@400;500;600;700&display=swap"" rel=""stylesheet"">
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background-color: #0b1120;
            font-family: 'Poppins', sans-serif;
            color: #1e293b;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
        }}
        .no-print-bar {{
            width: 100%;
            max-width: 1040px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 12px;
        }}
        .btn {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }}
        .btn-primary {{
            background: linear-gradient(135deg, #0d9488, #059669);
            color: #ffffff;
            box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3);
        }}
        .btn-primary:hover {{
            background: linear-gradient(135deg, #0f766e, #047857);
            transform: translateY(-1px);
        }}
        .btn-back {{
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            backdrop-filter: blur(8px);
        }}
        .btn-back:hover {{
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
        }}
        .cert-card {{
            width: 100%;
            max-width: 1040px;
            aspect-ratio: 1.414 / 1;
            background: #ffffff radial-gradient(circle at center, #ffffff 60%, #faf8f2 100%);
            border: 14px solid #1e293b;
            border-image: linear-gradient(to right, #0f172a, #0d9488, #d97706, #0f172a) 1;
            padding: 38px 48px;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
        }}
        .inner-border {{
            position: absolute;
            top: 14px; left: 14px; right: 14px; bottom: 14px;
            border: 2px solid rgba(217, 119, 6, 0.5);
            pointer-events: none;
        }}
        .header {{
            text-align: center;
            position: relative;
            z-index: 2;
        }}
        .brand {{
            font-family: 'Cinzel', serif;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 5px;
            color: #0f172a;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }}
        .badge-serial {{
            margin-top: 6px;
            font-size: 11px;
            letter-spacing: 2px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .cert-title {{
            font-family: 'Cinzel', serif;
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 18px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }}
        .cert-subtitle {{
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 15px;
            color: #64748b;
            margin-top: 4px;
        }}
        .body {{
            text-align: center;
            margin: 16px 0;
            position: relative;
            z-index: 2;
        }}
        .presented-to {{
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #94a3b8;
            font-weight: 600;
        }}
        .student-name {{
            font-family: 'Playfair Display', serif;
            font-size: 40px;
            font-weight: 700;
            color: #0f172a;
            margin: 10px 0 14px;
            border-bottom: 2px solid #e2e8f0;
            display: inline-block;
            padding: 0 40px 8px;
        }}
        .achievement {{
            font-size: 14px;
            color: #475569;
            max-width: 680px;
            margin: 0 auto;
            line-height: 1.6;
        }}
        .course-title {{
            font-size: 24px;
            font-weight: 700;
            color: #0d9488;
            margin-top: 8px;
            display: block;
        }}
        .footer {{
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            position: relative;
            z-index: 2;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
        }}
        .footer-item {{
            text-align: center;
            flex: 1;
        }}
        .signature-line {{
            width: 170px;
            height: 1px;
            background: #94a3b8;
            margin: 0 auto 8px;
        }}
        .sign-title {{
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
        }}
        .sign-sub {{
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .seal {{
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: radial-gradient(circle, #fef08a 0%, #d97706 100%);
            border: 4px double #ffffff;
            box-shadow: 0 8px 16px rgba(217, 119, 6, 0.35);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #78350f;
            text-align: center;
            font-weight: 800;
            font-size: 9px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0 auto;
        }}
        .verification {{
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            margin-top: 10px;
            font-family: monospace;
        }}
        @media print {{
            body {{
                background: none;
                padding: 0;
                margin: 0;
            }}
            .no-print-bar {{
                display: none !important;
            }}
            .cert-card {{
                max-width: none;
                width: 100vw;
                height: 100vh;
                box-shadow: none;
                page-break-inside: avoid;
            }}
            @page {{
                size: A4 landscape;
                margin: 0;
            }}
        }}
    </style>
</head>
<body>
    <div class=""no-print-bar"">
        <button onclick=""window.history.back()"" class=""btn btn-back"">
            ← უკან დაბრუნება
        </button>
        <button onclick=""window.print()"" class=""btn btn-primary"">
            🖨️ სერტიფიკატის ჩამოტვირთვა / PDF შენახვა
        </button>
    </div>

    <div class=""cert-card"">
        <div class=""inner-border""></div>

        <div class=""header"">
            <div class=""brand"">
                🎓 TOTC Online Academy
            </div>
            <div class=""badge-serial"">Certificate ID: {certNumber}</div>
            <h1 class=""cert-title"">სერტიფიკატი • Certificate of Completion</h1>
            <p class=""cert-subtitle"">Official Academic Credential of Professional Excellence</p>
        </div>

        <div class=""body"">
            <p class=""presented-to"">ეს სერტიფიკატი გადაეცემა / Proudly Presented To</p>
            <h2 class=""student-name"">{studentName}</h2>
            <p class=""achievement"">
                რომელმაც წარმატებით დაასრულა აკრედიტებული სასწავლო პროგრამა, ყველა ლექცია, პრაქტიკული დავალება და ჩააბარა ფინალური გამოცდა:
                <strong class=""course-title"">{courseTitle}</strong>
            </p>
        </div>

        <div class=""footer"">
            <div class=""footer-item"">
                <div class=""signature-line""></div>
                <div class=""sign-title"">{instructorName}</div>
                <div class=""sign-sub"">კურსის ინსტრუქტორი</div>
            </div>

            <div class=""footer-item"">
                <div class=""seal"">
                    <span>★ TOTC ★</span>
                    <span style=""font-size:7px;margin:2px 0;"">OFFICIAL</span>
                    <span>VERIFIED</span>
                </div>
            </div>

            <div class=""footer-item"">
                <div class=""signature-line""></div>
                <div class=""sign-title"">{issuedDate}</div>
                <div class=""sign-sub"">გაცემის თარიღი</div>
            </div>
        </div>

        <div class=""verification"">
            VERIFICATION HASH: {verifyHash} • VERIFY AT TOTC.GE{cert.VerificationUrl}
        </div>
    </div>
</body>
</html>";
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
