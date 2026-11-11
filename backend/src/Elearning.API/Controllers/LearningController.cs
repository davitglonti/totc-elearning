using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints powering the interactive student learning experience and lesson progression.
/// </summary>
[Authorize]
public class LearningController : BaseApiController
{
    private readonly IEnrollmentService _enrollmentService;

    public LearningController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    /// <summary>
    /// Retrieve full course syllabus and unlocked lesson video streams for enrolled students.
    /// </summary>
    [HttpGet("/api/courses/{courseId:guid}/learn")]
    [ProducesResponseType(typeof(CourseLearnDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseContent(Guid courseId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var content = await _enrollmentService.GetCourseLearningContentAsync(courseId, CurrentUserId.Value, CurrentUserEmail);
            return Ok(content);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Mark a lesson complete or update last watched position in seconds.
    /// </summary>
    [HttpPost("/api/lessons/{lessonId:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CompleteLesson(Guid lessonId, [FromBody] CompleteLessonDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var result = await _enrollmentService.CompleteLessonAsync(lessonId, CurrentUserId.Value, dto);
            return Ok(new { success = result, message = "Lesson progress recorded successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
