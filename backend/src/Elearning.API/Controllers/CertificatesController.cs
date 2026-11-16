using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for student course completion certificates, claims, and public authenticity verification.
/// </summary>
public class CertificatesController : BaseApiController
{
    private readonly ICertificateService _certificateService;

    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    /// <summary>
    /// Retrieve all completion certificates earned by the authenticated student.
    /// </summary>
    [Authorize]
    [HttpGet("my")]
    [ProducesResponseType(typeof(List<CertificateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCertificates()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var certificates = await _certificateService.GetUserCertificatesAsync(CurrentUserId.Value);
        return Ok(certificates);
    }

    /// <summary>
    /// Retrieve a specific certificate by its ID.
    /// </summary>
    [Authorize]
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCertificateById(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var cert = await _certificateService.GetCertificateByIdAsync(id, CurrentUserId.Value);
        if (cert == null) return NotFound(new { message = "Certificate not found." });

        return Ok(cert);
    }

    /// <summary>
    /// Retrieve certificate for a specific course earned by the current student.
    /// </summary>
    [Authorize]
    [HttpGet("courses/{courseId:guid}")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCertificateByCourseId(Guid courseId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var cert = await _certificateService.GetCertificateByCourseIdAsync(CurrentUserId.Value, courseId);
        if (cert == null)
        {
            try
            {
                cert = await _certificateService.IssueCertificateAsync(CurrentUserId.Value, courseId);
            }
            catch
            {
                return NotFound(new { message = "Certificate not found or course not yet completed." });
            }
        }

        return Ok(cert);
    }

    /// <summary>
    /// Claim / issue a certificate of completion for a completed course.
    /// </summary>
    [Authorize]
    [HttpPost("courses/{courseId:guid}/claim")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ClaimCertificate(Guid courseId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var cert = await _certificateService.IssueCertificateAsync(CurrentUserId.Value, courseId);
            return Ok(cert);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Download or render printable official certificate document by certificate serial number.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{certificateNumber}/download")]
    public async Task<IActionResult> DownloadCertificate(string certificateNumber)
    {
        var cert = await _certificateService.GetCertificateByNumberAsync(certificateNumber);
        if (cert == null) return NotFound(new { message = "Certificate not found." });

        var html = GenerateCertificateHtml(cert);
        return Content(html, "text/html; charset=utf-8");
    }

    /// <summary>
    /// Retrieve certificate details publicly for sharing and verification by serial number or hash.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("public/{identifier}")]
    [ProducesResponseType(typeof(CertificateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicCertificate(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier)) return BadRequest();

        var cert = await _certificateService.GetCertificateByNumberAsync(identifier);
        if (cert != null) return Ok(cert);

        if (Guid.TryParse(identifier, out var courseId))
        {
            if (CurrentUserId.HasValue)
            {
                var userCert = await _certificateService.GetCertificateByCourseIdAsync(CurrentUserId.Value, courseId);
                if (userCert != null) return Ok(userCert);
            }
        }

        return NotFound(new { message = "Certificate not found." });
    }

    /// <summary>
    /// Publicly verify the authenticity of a certificate using its verification hash or certificate number.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("verify/{hash}")]
    [ProducesResponseType(typeof(CertificateVerificationDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyCertificate(string hash)
    {
        var result = await _certificateService.VerifyCertificateAsync(hash);
        return Ok(result);
    }

    private static string GenerateCertificateHtml(CertificateDto cert)
    {
        var issuedDate = cert.IssuedAt.ToString("dd MMMM, yyyy");
        return $@"<!DOCTYPE html>
<html lang=""ka"">
<head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <title>TOTC Certificate - {cert.CertificateNumber}</title>
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
            <div class=""badge-serial"">Certificate ID: {cert.CertificateNumber}</div>
            <h1 class=""cert-title"">სერტიფიკატი • Certificate of Completion</h1>
            <p class=""cert-subtitle"">Official Academic Credential of Professional Excellence</p>
        </div>

        <div class=""body"">
            <p class=""presented-to"">ეს სერტიფიკატი გადაეცემა / Proudly Presented To</p>
            <h2 class=""student-name"">{cert.StudentName}</h2>
            <p class=""achievement"">
                რომელმაც წარმატებით დაასრულა აკრედიტებული სასწავლო პროგრამა, ყველა ლექცია, პრაქტიკული დავალება და ჩააბარა ფინალური გამოცდა:
                <strong class=""course-title"">{cert.CourseTitle}</strong>
            </p>
        </div>

        <div class=""footer"">
            <div class=""footer-item"">
                <div class=""signature-line""></div>
                <div class=""sign-title"">{cert.InstructorName}</div>
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
            VERIFICATION HASH: {cert.VerificationHash} • VERIFY AT TOTC.GE{cert.VerificationUrl}
        </div>
    </div>
</body>
</html>";
    }
}
