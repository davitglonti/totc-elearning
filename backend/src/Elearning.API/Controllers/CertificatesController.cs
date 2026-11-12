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
}
