using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
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

        if (string.IsNullOrWhiteSpace(videoGuid))
        {
            return NotFound(new { message = "Lesson or video not found." });
        }

        var cleanGuid = videoGuid.Trim();

        // 1. Locate the lesson and its parent section
        Lesson? lesson = null;
        var query = _context.Lessons.Include(l => l.Section).AsQueryable();

        if (courseId.HasValue)
        {
            lesson = await query.FirstOrDefaultAsync(l =>
                l.Section != null && l.Section.CourseId == courseId.Value &&
                ((l.VideoUrl != null && (l.VideoUrl == cleanGuid || l.VideoUrl.Contains(cleanGuid))) || l.Id.ToString() == cleanGuid));
        }

        if (lesson == null)
        {
            lesson = await query.FirstOrDefaultAsync(l =>
                (l.VideoUrl != null && (l.VideoUrl == cleanGuid || l.VideoUrl.Contains(cleanGuid))) ||
                l.Id.ToString() == cleanGuid);
        }

        if (lesson == null || lesson.Section == null)
        {
            return NotFound(new { message = "Lesson or video not found." });
        }

        // 2. Validate that parent course exists
        var parentCourseId = lesson.Section.CourseId;
        var course = await _context.Courses.FindAsync(parentCourseId);
        if (course == null)
        {
            return NotFound(new { message = "Lesson or video not found." });
        }

        // 3. Authorization Rule A: Free preview lessons are accessible to all authenticated users
        if (lesson.IsFreePreview)
        {
            var freePlayback = _bunnyStreamService.GenerateSignedPlayback(cleanGuid, 7200);
            return Ok(freePlayback);
        }

        var user = await _context.Users.FindAsync(CurrentUserId.Value);
        if (user == null) return Unauthorized();

        // 3. Authorization Rule B: Administrators and the course instructor have full access
        var isInstructorOrAdmin = user.Role == UserRole.Admin || course.InstructorId == user.Id;
        if (isInstructorOrAdmin)
        {
            var instructorPlayback = _bunnyStreamService.GenerateSignedPlayback(cleanGuid, 7200);
            return Ok(instructorPlayback);
        }

        // 3. Authorization Rule C: Actively enrolled students have access
        var isEnrolled = await _context.Enrollments.AnyAsync(
            e => e.CourseId == parentCourseId && e.UserId == user.Id);
        if (isEnrolled)
        {
            var enrolledPlayback = _bunnyStreamService.GenerateSignedPlayback(cleanGuid, 7200);
            return Ok(enrolledPlayback);
        }

        // 3. Authorization Rule D: Users with active platform subscription have access
        var isSubscribed = user.IsSubscribed &&
            (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
        if (isSubscribed)
        {
            var subPlayback = _bunnyStreamService.GenerateSignedPlayback(cleanGuid, 7200);
            return Ok(subPlayback);
        }

        // 4. Deny access if none of the above criteria are satisfied
        return StatusCode(StatusCodes.Status403Forbidden, new
        {
            error = "Forbidden",
            message = "Active enrollment or subscription required to stream this video."
        });
    }
}
