using Elearning.Application.Interfaces;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    private readonly IBunnyStreamService _bunnyStreamService;
    private readonly ElearningDbContext _context;

    public VideosController(IBunnyStreamService bunnyStreamService, ElearningDbContext context)
    {
        _bunnyStreamService = bunnyStreamService;
        _context = context;
    }

    /// <summary>
    /// Retrieve a time-limited (2-hour TTL) SHA-256 signed DRM playback token for a course lesson video.
    /// Access is granted to enrolled students, active Pro subscribers, course instructors, and administrators.
    /// </summary>
    [HttpGet("{videoGuid}/signed-playback")]
    [ProducesResponseType(typeof(SignedVideoPlaybackDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSignedPlayback(string videoGuid, [FromQuery] Guid? courseId = null)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        // If courseId is supplied, verify enrollment or subscription authorization
        if (courseId.HasValue)
        {
            var user = await _context.Users.FindAsync(CurrentUserId.Value);
            var isSubscribed = user != null && user.IsSubscribed && 
                (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);

            var isEnrolled = isSubscribed || await _context.Enrollments.AnyAsync(
                e => e.CourseId == courseId.Value && e.UserId == CurrentUserId.Value);

            var isInstructorOrAdmin = user != null && 
                (user.Role == UserRole.Admin || await _context.Courses.AnyAsync(c => c.Id == courseId.Value && c.InstructorId == user.Id));

            if (!isEnrolled && !isInstructorOrAdmin)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new 
                { 
                    error = "Forbidden", 
                    message = "You must be enrolled in this course to access the DRM signed video stream." 
                });
            }
        }

        var signedPlayback = _bunnyStreamService.GenerateSignedPlayback(videoGuid, 7200);
        return Ok(signedPlayback);
    }
}
