using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Public endpoints for browsing courses, searching, filtering, and syllabus inspection.
/// </summary>
public class CoursesController : BaseApiController
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    /// <summary>
    /// Retrieve courses with text search, category filtering, level, sorting, and pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CourseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses([FromQuery] CourseFilterParams filterParams)
    {
        var result = await _courseService.GetCoursesAsync(filterParams);
        return Ok(result);
    }

    /// <summary>
    /// Get full course details, syllabus sections, lessons preview, and reviews.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CourseDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var course = await _courseService.GetCourseByIdAsync(id, CurrentUserId);
        if (course == null) return NotFound(new { message = "Course not found." });

        return Ok(course);
    }
}
