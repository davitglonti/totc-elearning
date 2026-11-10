using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for student enrollments and personal course dashboard.
/// </summary>
[Authorize]
public class EnrollmentsController : BaseApiController
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    /// <summary>
    /// Retrieve all courses purchased/enrolled by the authenticated user with completion percentages.
    /// </summary>
    [HttpGet("/api/my-courses")]
    [ProducesResponseType(typeof(List<MyCourseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCourses()
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var courses = await _enrollmentService.GetUserCoursesAsync(CurrentUserId.Value);
        return Ok(courses);
    }

    /// <summary>
    /// Direct enrollment for free courses or instant enrollment actions.
    /// </summary>
    [HttpPost("/api/courses/{courseId:guid}/enroll")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Enroll(Guid courseId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var success = await _enrollmentService.EnrollUserAsync(CurrentUserId.Value, courseId);
        return Ok(new { success, message = "Successfully enrolled in course." });
    }
}
