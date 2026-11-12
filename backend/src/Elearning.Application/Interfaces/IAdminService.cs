using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Service managing administrator telemetry, user roles, course catalog moderation, and financial records.
/// </summary>
public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<List<AdminUserListItemDto>> GetUsersAsync();
    Task<bool> UpdateUserRoleAsync(Guid userId, string role);
    Task<bool> DeleteUserAsync(Guid userId, Guid currentAdminId);
    Task<List<AdminCourseListItemDto>> GetCoursesAsync();
    Task<AdminCourseReviewDto?> GetCourseReviewAsync(Guid courseId);
    Task<bool> ApproveCourseAsync(Guid courseId);
    Task<bool> RejectCourseAsync(Guid courseId, string reason);
    Task<bool> ToggleCoursePublishAsync(Guid courseId);
    Task<bool> DeleteCourseAsync(Guid courseId);
    Task<List<AdminOrderListItemDto>> GetOrdersAsync();
}
