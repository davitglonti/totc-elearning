using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Service encapsulating video access validation and DRM signed playback delivery.
/// </summary>
public class VideoService : IVideoService
{
    private readonly ElearningDbContext _context;
    private readonly IBunnyStreamService _bunnyStreamService;

    public VideoService(ElearningDbContext context, IBunnyStreamService bunnyStreamService)
    {
        _context = context;
        _bunnyStreamService = bunnyStreamService;
    }

    public async Task<SignedVideoPlaybackDto> GetAuthorizedPlaybackAsync(
        Guid userId, 
        string videoGuid, 
        Guid? courseId = null, 
        int ttlSeconds = 7200)
    {
        if (string.IsNullOrWhiteSpace(videoGuid))
        {
            throw new KeyNotFoundException("Lesson or video not found.");
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
            throw new KeyNotFoundException("Lesson or video not found.");
        }

        // 2. Validate parent course existence
        var parentCourseId = lesson.Section.CourseId;
        var course = await _context.Courses.FindAsync(parentCourseId);
        if (course == null)
        {
            throw new KeyNotFoundException("Lesson or video not found.");
        }

        // 3. Authorization Rule A: Free preview lessons are accessible to all authenticated users
        if (lesson.IsFreePreview)
        {
            return _bunnyStreamService.GenerateSignedPlayback(cleanGuid, ttlSeconds);
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        // 3. Authorization Rule B: Administrators and the course instructor have full access
        var isInstructorOrAdmin = user.Role == UserRole.Admin || course.InstructorId == user.Id;
        if (isInstructorOrAdmin)
        {
            return _bunnyStreamService.GenerateSignedPlayback(cleanGuid, ttlSeconds);
        }

        // 3. Authorization Rule C: Actively enrolled students have access
        var isEnrolled = await _context.Enrollments.AnyAsync(
            e => e.CourseId == parentCourseId && e.UserId == user.Id);
        if (isEnrolled)
        {
            return _bunnyStreamService.GenerateSignedPlayback(cleanGuid, ttlSeconds);
        }

        // 3. Authorization Rule D: Users with active platform subscription have access
        var isSubscribed = user.IsSubscribed &&
            (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
        if (isSubscribed)
        {
            return _bunnyStreamService.GenerateSignedPlayback(cleanGuid, ttlSeconds);
        }

        // 4. Deny access if none of the above criteria are satisfied
        throw new UnauthorizedAccessException("Active enrollment or subscription required to stream this video.");
    }
}
