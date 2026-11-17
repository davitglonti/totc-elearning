using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing course authoring, multi-section/lesson curriculum synchronization,
/// publication state toggling, and instructor analytics.
/// </summary>
public interface IInstructorCourseService
{
    Task<InstructorSummaryDto> GetMyInstructorCoursesAsync(Guid userId, string? userEmail);
    Task<InstructorCourseItemDto> CreateFullCourseAsync(Guid userId, string? userEmail, bool isAdmin, CreateFullCourseDto dto);
    Task<(bool IsPublished, string Message)> TogglePublishAsync(Guid courseId, Guid userId, bool isAdmin);
    Task DeleteCourseAsync(Guid courseId, Guid userId, bool isAdmin);
    Task<InstructorCourseEditDto> GetFullCourseForEditAsync(Guid courseId, Guid userId, string? userEmail, bool isAdmin);
    Task<InstructorCourseItemDto> UpdateFullCourseAsync(Guid courseId, Guid userId, string? userEmail, bool isAdmin, UpdateFullCourseDto dto);
}
