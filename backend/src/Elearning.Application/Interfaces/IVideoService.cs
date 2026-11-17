namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing video stream authorization and DRM token generation.
/// </summary>
public interface IVideoService
{
    /// <summary>
    /// Validates enrollment, subscription, instructor authorship, or free preview status,
    /// then generates a time-limited SHA-256 signed DRM playback token.
    /// </summary>
    Task<SignedVideoPlaybackDto> GetAuthorizedPlaybackAsync(Guid userId, string videoGuid, Guid? courseId = null, int ttlSeconds = 7200);
}
