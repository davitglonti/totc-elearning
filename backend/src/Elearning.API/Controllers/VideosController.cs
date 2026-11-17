using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for delivering DRM tokenized video playback URLs.
/// Generates short-lived SHA-256 signed HLS, MP4, and iframe embed streams.
/// </summary>
[Authorize]
[ApiController]
[Route("api/videos")]
public class VideosController : BaseApiController
{
    private readonly IVideoService _videoService;

    public VideosController(IVideoService videoService)
    {
        _videoService = videoService;
    }

    /// <summary>
    /// Retrieve a time-limited (2-hour TTL) SHA-256 signed DRM playback token for a course lesson video.
    /// Access is strictly validated against course enrollment, active subscription, course authorship, or free preview.
    /// </summary>
    [HttpGet("{videoGuid}/signed-playback")]
    [ProducesResponseType(typeof(SignedVideoPlaybackDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSignedPlayback(string videoGuid, [FromQuery] Guid? courseId = null)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var signedPlayback = await _videoService.GetAuthorizedPlaybackAsync(CurrentUserId.Value, videoGuid, courseId);
            return Ok(signedPlayback);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                error = "Forbidden",
                message = ex.Message
            });
        }
    }
}
