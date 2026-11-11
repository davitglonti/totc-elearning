using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing course catalog, search, filtering, and curriculum editing.
/// </summary>
public interface ICourseService
{
    Task<PagedResult<CourseDto>> GetCoursesAsync(CourseFilterParams filterParams);
    Task<CourseDetailDto?> GetCourseByIdAsync(Guid courseId, Guid? currentUserId, string? currentUserEmail = null);
    Task<List<CategoryDto>> GetCategoriesAsync();
    
    // Instructor / Admin management
    Task<CourseDto> CreateCourseAsync(Guid instructorId, CreateCourseDto dto);
    Task<CourseDto> UpdateCourseAsync(Guid courseId, Guid instructorId, bool isAdmin, UpdateCourseDto dto);
    Task<SectionDto> AddSectionAsync(Guid courseId, Guid instructorId, bool isAdmin, CreateSectionDto dto);
    Task<LessonDto> AddLessonAsync(Guid sectionId, Guid instructorId, bool isAdmin, CreateLessonDto dto);
}
