using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Authoring endpoints for certified instructors and platform administrators.
/// </summary>
[Authorize(Roles = "Instructor,Admin")]
[Route("api/instructor")]
public class InstructorCoursesController : BaseApiController
{
    private readonly ICourseService _courseService;
    private readonly IMediaService _mediaService;

    public InstructorCoursesController(ICourseService courseService, IMediaService mediaService)
    {
        _courseService = courseService;
        _mediaService = mediaService;
    }

    /// <summary>
    /// Create a new course draft.
    /// </summary>
    [HttpPost("courses")]
    [ProducesResponseType(typeof(CourseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var course = await _courseService.CreateCourseAsync(CurrentUserId.Value, dto);
        return CreatedAtAction(nameof(CoursesController.GetCourseById), "Courses", new { id = course.Id }, course);
    }

    /// <summary>
    /// Update existing course metadata.
    /// </summary>
    [HttpPut("courses/{id:guid}")]
    [ProducesResponseType(typeof(CourseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var updated = await _courseService.UpdateCourseAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(updated);
    }

    /// <summary>
    /// Add a new curriculum module / section to a course.
    /// </summary>
    [HttpPost("courses/{id:guid}/sections")]
    [ProducesResponseType(typeof(SectionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddSection(Guid id, [FromBody] CreateSectionDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var section = await _courseService.AddSectionAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(section);
    }

    /// <summary>
    /// Add a new lesson to a curriculum section.
    /// </summary>
    [HttpPost("sections/{sectionId:guid}/lessons")]
    [ProducesResponseType(typeof(LessonDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddLesson(Guid sectionId, [FromBody] CreateLessonDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var lesson = await _courseService.AddLessonAsync(sectionId, CurrentUserId.Value, IsAdmin, dto);
        return Ok(lesson);
    }

    /// <summary>
    /// Upload a video or image file to cloud/local media storage.
    /// </summary>
    [HttpPost("media/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadMedia(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        using var stream = file.OpenReadStream();
        var url = await _mediaService.UploadFileAsync(stream, file.FileName, file.ContentType);

        return Ok(new { url });
    }
}
