using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing student enrollments, learning dashboard, and progress tracking.
/// </summary>
public interface IEnrollmentService
{
    Task<List<MyCourseDto>> GetUserCoursesAsync(Guid userId);
    Task<CourseLearnDto> GetCourseLearningContentAsync(Guid courseId, Guid userId, string? userEmail = null);
    Task<bool> CompleteLessonAsync(Guid lessonId, Guid userId, CompleteLessonDto dto);
    Task<bool> EnrollUserAsync(Guid userId, Guid courseId);
    
    // Reviews
    Task<List<ReviewDto>> GetCourseReviewsAsync(Guid courseId);
    Task<ReviewDto> AddCourseReviewAsync(Guid courseId, Guid userId, CreateReviewDto dto);
}
