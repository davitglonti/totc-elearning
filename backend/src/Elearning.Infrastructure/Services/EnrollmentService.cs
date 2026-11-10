using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements student learning dashboard, enrollment verification, and progress tracking.
/// </summary>
public class EnrollmentService : IEnrollmentService
{
    private readonly ElearningDbContext _context;

    public EnrollmentService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyCourseDto>> GetUserCoursesAsync(Guid userId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Course).ThenInclude(c => c!.Instructor)
            .Include(e => e.Course).ThenInclude(c => c!.Sections).ThenInclude(s => s.Lessons)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        var userLessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.UserId == userId && lp.IsCompleted)
            .Select(lp => lp.LessonId)
            .ToListAsync();

        var result = new List<MyCourseDto>();

        foreach (var e in enrollments)
        {
            if (e.Course == null) continue;

            var allLessonIds = e.Course.Sections.SelectMany(s => s.Lessons).Select(l => l.Id).ToList();
            var totalLessons = allLessonIds.Count;
            var completedCount = allLessonIds.Count(id => userLessonProgresses.Contains(id));
            var percentage = totalLessons > 0 ? (int)Math.Round((double)completedCount / totalLessons * 100) : 0;

            result.Add(new MyCourseDto
            {
                CourseId = e.CourseId,
                Title = e.Course.Title,
                ThumbnailUrl = e.Course.ThumbnailUrl,
                InstructorName = e.Course.Instructor?.FullName ?? string.Empty,
                EnrolledAt = e.EnrolledAt,
                CompletedLessonsCount = completedCount,
                TotalLessonsCount = totalLessons,
                ProgressPercentage = percentage,
                IsCompleted = e.IsCompleted || (totalLessons > 0 && completedCount == totalLessons)
            });
        }

        return result;
    }

    public async Task<CourseLearnDto> GetCourseLearningContentAsync(Guid courseId, Guid userId)
    {
        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

        var course = await _context.Courses
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        var userProgressMap = await _context.LessonProgresses
            .Where(lp => lp.UserId == userId)
            .ToDictionaryAsync(lp => lp.LessonId, lp => lp);

        var allLessons = course.Sections.SelectMany(s => s.Lessons).ToList();
        var completedLessons = allLessons.Count(l => userProgressMap.TryGetValue(l.Id, out var p) && p.IsCompleted);
        var progressPercent = allLessons.Count > 0 ? (int)Math.Round((double)completedLessons / allLessons.Count * 100) : 0;

        return new CourseLearnDto
        {
            CourseId = course.Id,
            Title = course.Title,
            Description = course.Description,
            ProgressPercentage = progressPercent,
            Sections = course.Sections.Select(s => new SectionLearnDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.Select(l =>
                {
                    var hasProgress = userProgressMap.TryGetValue(l.Id, out var lp);
                    var canAccess = isEnrolled || l.IsFreePreview;

                    return new LessonLearnDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        VideoUrl = canAccess ? l.VideoUrl : null,
                        DurationMinutes = l.DurationMinutes,
                        ContentText = canAccess ? l.ContentText : "Enroll to view this lesson content.",
                        IsFreePreview = l.IsFreePreview,
                        OrderIndex = l.OrderIndex,
                        IsCompleted = hasProgress && lp!.IsCompleted,
                        LastWatchedPositionSeconds = hasProgress ? lp!.LastWatchedPositionSeconds : 0
                    };
                }).ToList()
            }).ToList()
        };
    }

    public async Task<bool> CompleteLessonAsync(Guid lessonId, Guid userId, CompleteLessonDto dto)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section).ThenInclude(s => s!.Course)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null)
            throw new KeyNotFoundException("Lesson not found.");

        var courseId = lesson.Section!.CourseId;
        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == userId);
        if (!isEnrolled && !lesson.IsFreePreview)
        {
            throw new UnauthorizedAccessException("You must be enrolled in the course to complete lessons.");
        }

        var progress = await _context.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == lessonId && lp.UserId == userId);
        if (progress == null)
        {
            progress = new LessonProgress
            {
                LessonId = lessonId,
                UserId = userId,
                IsCompleted = dto.MarkAsComplete,
                LastWatchedPositionSeconds = dto.LastWatchedPositionSeconds,
                CompletedAt = dto.MarkAsComplete ? DateTime.UtcNow : null
            };
            _context.LessonProgresses.Add(progress);
        }
        else
        {
            progress.LastWatchedPositionSeconds = dto.LastWatchedPositionSeconds;
            if (dto.MarkAsComplete && !progress.IsCompleted)
            {
                progress.IsCompleted = true;
                progress.CompletedAt = DateTime.UtcNow;
            }
        }

        // Check if all lessons are now complete to mark enrollment completed
        if (isEnrolled && dto.MarkAsComplete)
        {
            var allLessonIds = await _context.Lessons
                .Where(l => l.Section!.CourseId == courseId)
                .Select(l => l.Id)
                .ToListAsync();

            var completedLessonCount = await _context.LessonProgresses
                .CountAsync(lp => lp.UserId == userId && lp.IsCompleted && allLessonIds.Contains(lp.LessonId));

            if (completedLessonCount >= allLessonIds.Count)
            {
                var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
                if (enrollment != null && !enrollment.IsCompleted)
                {
                    enrollment.IsCompleted = true;
                    enrollment.CompletedAt = DateTime.UtcNow;
                }
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EnrollUserAsync(Guid userId, Guid courseId)
    {
        var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);
        if (!courseExists)
            throw new KeyNotFoundException("Course not found.");

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (alreadyEnrolled)
            return true; // Already active

        _context.Enrollments.Add(new Enrollment
        {
            UserId = userId,
            CourseId = courseId,
            EnrolledAt = DateTime.UtcNow,
            IsCompleted = false
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ReviewDto>> GetCourseReviewsAsync(Guid courseId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.CourseId == courseId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User != null ? r.User.FullName : "Student",
                UserAvatar = r.User != null ? r.User.AvatarUrl : null,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ReviewDto> AddCourseReviewAsync(Guid courseId, Guid userId, CreateReviewDto dto)
    {
        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == userId);
        if (!isEnrolled)
            throw new UnauthorizedAccessException("Only enrolled students can review this course.");

        var review = new Review
        {
            CourseId = courseId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        await _context.Entry(review).Reference(r => r.User).LoadAsync();

        return new ReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = review.User?.FullName ?? "Student",
            UserAvatar = review.User?.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
