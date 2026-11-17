using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing course completion certificates, issuance, and cryptographic verification.
/// </summary>
public interface ICertificateService
{
    Task<List<CertificateDto>> GetUserCertificatesAsync(Guid userId);
    Task<CertificateDto?> GetCertificateByIdAsync(Guid certificateId, Guid userId);
    Task<CertificateDto?> GetCertificateByCourseIdAsync(Guid userId, Guid courseId);
    Task<CertificateDto?> GetCertificateByNumberAsync(string certificateNumber);
    Task<CertificateVerificationDto> VerifyCertificateAsync(string verificationHash);
    Task<CertificateDto> IssueCertificateAsync(Guid userId, Guid courseId);
    Task<string?> GenerateCertificateHtmlAsync(string certificateNumber);
}
