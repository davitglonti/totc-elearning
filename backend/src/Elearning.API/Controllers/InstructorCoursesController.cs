using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for instructors to manage authored courses, upload lecture videos, and organize curriculum modules.
/// </summary>
[Authorize(Roles = "Instructor,Admin")]
[ApiController]
[Route("api/instructor")]
public class InstructorCoursesController : BaseApiController
{
    private readonly IInstructorCourseService _instructorCourseService;
    private readonly ICourseService _courseService;
    private readonly IMediaService _mediaService;
    private readonly IBunnyStreamService _bunnyStreamService;

    public InstructorCoursesController(
        IInstructorCourseService instructorCourseService,
        ICourseService courseService, 
        IMediaService mediaService,
        IBunnyStreamService bunnyStreamService)
    {
        _instructorCourseService = instructorCourseService;
        _courseService = courseService;
        _mediaService = mediaService;
        _bunnyStreamService = bunnyStreamService;
    }

    /// <summary>
    /// Retrieve real course metrics, lectures count, enrollments, and curriculum for the authenticated instructor.
    /// </summary>
    [HttpGet("my-courses")]
    [ProducesResponseType(typeof(InstructorSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyInstructorCourses()
    {
        if (!CurrentUserId.HasValue && string.IsNullOrWhiteSpace(CurrentUserEmail))
            return Unauthorized(new { message = "Session expired. Please log out and log in again." });

        try
        {
            var summary = await _instructorCourseService.GetMyInstructorCoursesAsync(CurrentUserId ?? Guid.Empty, CurrentUserEmail);
            return Ok(summary);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a complete course with modules and lecture video lessons in a single atomic action.
    /// </summary>
    [HttpPost("courses/full")]
    [ProducesResponseType(typeof(InstructorCourseItemDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFullCourse([FromBody] CreateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Course title is required." });

        if (!CurrentUserId.HasValue && string.IsNullOrWhiteSpace(CurrentUserEmail))
            return Unauthorized(new { message = "Session expired or user account not found. Please log out and log back in." });

        try
        {
            var resultDto = await _instructorCourseService.CreateFullCourseAsync(CurrentUserId ?? Guid.Empty, CurrentUserEmail, IsAdmin, dto);
            return CreatedAtAction(nameof(CoursesController.GetCourseById), "Courses", new { id = resultDto.Id }, resultDto);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Toggle publish status of instructor's course.
    /// </summary>
    [HttpPut("courses/{id:guid}/toggle-publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TogglePublish(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var (isPublished, message) = await _instructorCourseService.TogglePublishAsync(id, CurrentUserId.Value, IsAdmin);
            return Ok(new { message, isPublished });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Soft delete course authored by the instructor.
    /// </summary>
    [HttpDelete("courses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            await _instructorCourseService.DeleteCourseAsync(id, CurrentUserId.Value, IsAdmin);
            return Ok(new { message = "Course deleted successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
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

        var course = await _courseService.UpdateCourseAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(course);
    }

    /// <summary>
    /// Add a curriculum section / module to an existing course.
    /// </summary>
    [HttpPost("courses/{id:guid}/sections")]
    [ProducesResponseType(typeof(SectionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddSection(Guid id, [FromBody] CreateSectionDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var section = await _courseService.AddSectionAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(section);
    }

    /// <summary>
    /// Add a lecture lesson to an existing module.
    /// </summary>
    [HttpPost("sections/{sectionId:guid}/lessons")]
    [ProducesResponseType(typeof(LessonDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddLesson(Guid sectionId, [FromBody] CreateLessonDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var lesson = await _courseService.AddLessonAsync(sectionId, CurrentUserId.Value, IsAdmin, dto);
        return Ok(lesson);
    }

    /// <summary>
    /// Upload course thumbnail image or generic lecture attachment to local storage.
    /// </summary>
    [HttpPost("media/upload")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadMedia(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > 200 * 1024 * 1024)
            return BadRequest(new { message = "File exceeds 200MB size limit." });

        using var stream = file.OpenReadStream();
        var url = await _mediaService.UploadFileAsync(stream, file.FileName, file.ContentType);

        return Ok(new { url });
    }

    /// <summary>
    /// Upload lecture video directly to Bunny Stream CDN with automated transcode and multi-bitrate HLS.
    /// Supports streaming uploads up to 2 GB with seekable file buffering.
    /// </summary>
    [HttpPost("media/upload-bunny")]
    [RequestSizeLimit(2147483648)] // 2 GB limit for raw 4K/1080p lesson video
    [ProducesResponseType(typeof(BunnyUploadResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadVideoToBunny(IFormFile file, [FromForm] string? title = null)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No video file provided." });

        using var stream = file.OpenReadStream();
        var videoTitle = string.IsNullOrWhiteSpace(title) ? Path.GetFileNameWithoutExtension(file.FileName) : title.Trim();
        var result = await _bunnyStreamService.UploadVideoAsync(stream, file.FileName, videoTitle);

        if (!result.Success)
            return BadRequest(new { message = result.Message ?? "Failed to upload video to Bunny Stream CDN." });

        return Ok(result);
    }

    /// <summary>
    /// Retrieve complete course hierarchy including sections, lessons, quizzes, questions, and options for editing.
    /// </summary>
    [HttpGet("courses/{id:guid}/full")]
    [ProducesResponseType(typeof(InstructorCourseEditDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFullCourseForEdit(Guid id)
    {
        if (!CurrentUserId.HasValue && string.IsNullOrWhiteSpace(CurrentUserEmail))
            return Unauthorized();

        try
        {
            var dto = await _instructorCourseService.GetFullCourseForEditAsync(id, CurrentUserId ?? Guid.Empty, CurrentUserEmail, IsAdmin);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Update existing course curriculum, add/remove modules, add/remove/edit video lessons, and resubmit for approval.
    /// </summary>
    [HttpPut("courses/{id:guid}/full")]
    [ProducesResponseType(typeof(InstructorCourseItemDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateFullCourse(Guid id, [FromBody] UpdateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Course title is required." });

        if (!CurrentUserId.HasValue && string.IsNullOrWhiteSpace(CurrentUserEmail))
            return Unauthorized();

        try
        {
            var resultDto = await _instructorCourseService.UpdateFullCourseAsync(id, CurrentUserId ?? Guid.Empty, CurrentUserEmail, IsAdmin, dto);
            return Ok(resultDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
