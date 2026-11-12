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
    /// Direct enrollment for free courses or verified purchasers.
    /// Paid courses require a verified payment order or active Pro subscription.
    /// </summary>
    [HttpPost("/api/courses/{courseId:guid}/enroll")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Enroll(Guid courseId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var success = await _enrollmentService.EnrollUserAsync(CurrentUserId.Value, courseId);
            return Ok(new { success, message = "Successfully enrolled in course." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }
}
