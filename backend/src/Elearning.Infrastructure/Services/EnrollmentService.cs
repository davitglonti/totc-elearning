using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
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
        var user = await _context.Users.FindAsync(userId);
        var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);

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
        var enrolledCourseIds = new HashSet<Guid>();

        foreach (var e in enrollments)
        {
            if (e.Course == null) continue;
            enrolledCourseIds.Add(e.CourseId);

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
                IsCompleted = e.IsCompleted || (totalLessons > 0 && completedCount == totalLessons),
                IsProAccess = isSubscribed
            });
        }

        // If user is a Pro Subscriber, automatically include all other published courses!
        if (isSubscribed)
        {
            var otherCourses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Sections).ThenInclude(s => s.Lessons)
                .Where(c => c.IsPublished && !enrolledCourseIds.Contains(c.Id))
                .ToListAsync();

            foreach (var c in otherCourses)
            {
                var allLessonIds = c.Sections.SelectMany(s => s.Lessons).Select(l => l.Id).ToList();
                var totalLessons = allLessonIds.Count;
                var completedCount = allLessonIds.Count(id => userLessonProgresses.Contains(id));
                var percentage = totalLessons > 0 ? (int)Math.Round((double)completedCount / totalLessons * 100) : 0;

                result.Add(new MyCourseDto
                {
                    CourseId = c.Id,
                    Title = c.Title,
                    ThumbnailUrl = c.ThumbnailUrl,
                    InstructorName = c.Instructor?.FullName ?? string.Empty,
                    EnrolledAt = DateTime.UtcNow,
                    CompletedLessonsCount = completedCount,
                    TotalLessonsCount = totalLessons,
                    ProgressPercentage = percentage,
                    IsCompleted = totalLessons > 0 && completedCount == totalLessons,
                    IsProAccess = true
                });
            }
        }

        return result;
    }

    public async Task<CourseLearnDto> GetCourseLearningContentAsync(Guid courseId, Guid userId, string? userEmail = null)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null && !string.IsNullOrWhiteSpace(userEmail))
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());
        }

        var course = await _context.Courses
            .Include(c => c.Instructor)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
                    .ThenInclude(l => l.Quiz)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
        var isInstructorOrAdmin = user != null && (user.Role == Domain.Enums.UserRole.Admin || course.InstructorId == user.Id || (!string.IsNullOrWhiteSpace(user.Email) && course.Instructor != null && course.Instructor.Email.ToLower() == user.Email.ToLower()));

        // Access is granted if user is the course instructor, admin, individually enrolled, OR has an active Pro subscription!
        var isEnrolled = isInstructorOrAdmin || isSubscribed || (user != null && await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == user.Id));

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

                    List<LessonResourceDto> resourcesList = new();
                    if (!string.IsNullOrWhiteSpace(l.ResourcesJson))
                    {
                        try
                        {
                            resourcesList = System.Text.Json.JsonSerializer.Deserialize<List<LessonResourceDto>>(
                                l.ResourcesJson, 
                                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                        }
                        catch { }
                    }

                    return new LessonLearnDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        VideoUrl = canAccess ? l.VideoUrl : null,
                        DurationMinutes = l.DurationMinutes,
                        ContentText = canAccess ? l.ContentText : "Enroll to view this lesson content.",
                        IsFreePreview = l.IsFreePreview,
                        OrderIndex = l.OrderIndex,
                        LessonType = l.LessonType ?? "Video",
                        HasQuiz = l.Quiz != null,
                        IsCompleted = hasProgress && lp!.IsCompleted,
                        LastWatchedPositionSeconds = hasProgress ? lp!.LastWatchedPositionSeconds : 0,
                        Resources = canAccess ? resourcesList : new List<LessonResourceDto>()
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

        // Auto-enroll active Pro subscriber if not explicitly enrolled
        var user = await _context.Users.FindAsync(userId);
        var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

        if (!isEnrolled && isSubscribed)
        {
            _context.Enrollments.Add(new Enrollment
            {
                UserId = userId,
                CourseId = courseId,
                EnrolledAt = DateTime.UtcNow,
                IsCompleted = false
            });
            await _context.SaveChangesAsync();
            isEnrolled = true;
        }

        if (!isEnrolled && !lesson.IsFreePreview)
        {
            throw new UnauthorizedAccessException("You must be enrolled in the course to complete lessons.");
        }

        // Enforce Sequential Lesson Progression: all prior lessons in curriculum order must be completed first
        if (dto.MarkAsComplete)
        {
            var courseLessons = await _context.Lessons
                .Where(l => l.Section!.CourseId == courseId)
                .OrderBy(l => l.Section!.OrderIndex)
                .ThenBy(l => l.OrderIndex)
                .Select(l => l.Id)
                .ToListAsync();

            var currentLessonIndex = courseLessons.IndexOf(lessonId);
            if (currentLessonIndex > 0)
            {
                var priorLessonIds = courseLessons.Take(currentLessonIndex).ToList();
                var completedPriorCount = await _context.LessonProgresses
                    .CountAsync(lp => lp.UserId == userId && lp.IsCompleted && priorLessonIds.Contains(lp.LessonId));

                if (completedPriorCount < priorLessonIds.Count)
                {
                    throw new InvalidOperationException("Sequential lesson progression enforced. You must complete preceding lessons before completing this lesson.");
                }
            }
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

        // Check if all lessons are now complete to mark enrollment completed and issue Certificate
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

                // Automatically generate Certificate upon 100% course completion
                var certExists = await _context.Certificates.AnyAsync(c => c.UserId == userId && c.CourseId == courseId);
                if (!certExists)
                {
                    var serialNumber = $"TOTC-2026-{Guid.NewGuid():N}"[..17].ToUpperInvariant();
                    var rawHash = $"{userId:N}:{courseId:N}:{serialNumber}:{DateTime.UtcNow:O}";
                    var hashBytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawHash));
                    var verificationHash = Convert.ToHexString(hashBytes).ToLowerInvariant()[..32];

                    _context.Certificates.Add(new Certificate
                    {
                        UserId = userId,
                        CourseId = courseId,
                        CertificateNumber = serialNumber,
                        VerificationHash = verificationHash,
                        IssuedAt = DateTime.UtcNow,
                        PdfUrl = $"/api/certificates/{serialNumber}/download"
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> EnrollUserAsync(Guid userId, Guid courseId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        var alreadyEnrolled = await _context.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (alreadyEnrolled)
            return true; // Already active

        // If the course is paid (Price > 0), forbid direct enrollment unless user has active Pro subscription, is instructor/admin, or has a verified paid Order
        if (course.Price > 0)
        {
            var user = await _context.Users.FindAsync(userId);
            var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
            var isInstructorOrAdmin = user != null && (user.Role == UserRole.Admin || course.InstructorId == user.Id);

            var hasPaidOrder = _context.Orders.Local.Any(o => o.UserId == userId && o.CourseId == courseId && o.PaymentStatus == PaymentStatus.Paid)
                || await _context.Orders.AnyAsync(o => o.UserId == userId && o.CourseId == courseId && o.PaymentStatus == PaymentStatus.Paid);

            if (!isSubscribed && !isInstructorOrAdmin && !hasPaidOrder)
            {
                throw new UnauthorizedAccessException("This is a paid course. Enrollment requires an active Pro subscription or a completed paid order.");
            }
        }

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
