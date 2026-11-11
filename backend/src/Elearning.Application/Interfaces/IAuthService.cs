using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing user authentication, registration, profile operations, and instructor profiles.
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto dto);
    Task<UserProfileDto> GetProfileAsync(Guid userId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<InstructorPublicProfileDto> GetInstructorPublicProfileAsync(string idOrName);
}
