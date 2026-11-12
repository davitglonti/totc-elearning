using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Dedicated administrator management endpoints for system telemetry,
/// user roles, course catalog moderation, and financial records.
/// </summary>
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;
    private readonly IBunnyStreamService _bunnyService;

    public AdminController(IAdminService adminService, IBunnyStreamService bunnyService)
    {
        _adminService = adminService;
        _bunnyService = bunnyService;
    }

    /// <summary>
    /// Retrieve real-time operational statistics and system health telemetry.
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _adminService.GetStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Retrieve full list of platform users with roles and enrollment counts.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(List<AdminUserListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminService.GetUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Update a user's platform authorization role.
    /// </summary>
    [HttpPut("users/{id:guid}/role")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto dto)
    {
        try
        {
            await _adminService.UpdateUserRoleAsync(id, dto.Role);
            return Ok(new { message = $"User role updated to {dto.Role} successfully.", userId = id, role = dto.Role });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a platform user account (protected against self-deletion; soft-deleted).
    /// </summary>
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            await _adminService.DeleteUserAsync(id, CurrentUserId.Value);
            return Ok(new { message = "User deleted successfully." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Retrieve full course catalog for administrator inspection and publishing control.
    /// </summary>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(List<AdminCourseListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _adminService.GetCoursesAsync();
        return Ok(courses);
    }

    /// <summary>
    /// Retrieve complete curriculum of a course for administrator audit and review.
    /// </summary>
    [HttpGet("courses/{id:guid}/review")]
    [ProducesResponseType(typeof(AdminCourseReviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseReview(Guid id)
    {
        var reviewDto = await _adminService.GetCourseReviewAsync(id);
        if (reviewDto == null) return NotFound(new { message = "Course not found." });

        return Ok(reviewDto);
    }

    /// <summary>
    /// Approve an instructor's pending course and publish it live to the LMS catalog.
    /// </summary>
    [HttpPut("courses/{id:guid}/approve")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveCourse(Guid id)
    {
        try
        {
            await _adminService.ApproveCourseAsync(id);
            return Ok(new 
            { 
                message = "Course approved and successfully published to the TOTC LMS catalog!", 
                courseId = id, 
                approvalStatus = "Approved", 
                isPublished = true 
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject an instructor's course and request curriculum revisions.
    /// </summary>
    [HttpPut("courses/{id:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectCourse(Guid id, [FromBody] RejectCourseDto dto)
    {
        try
        {
            await _adminService.RejectCourseAsync(id, dto.Reason);
            return Ok(new 
            { 
                message = "Course returned to instructor with change request.", 
                courseId = id, 
                approvalStatus = "Rejected", 
                rejectionReason = dto.Reason 
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Toggle course publish/unpublish visibility state.
    /// </summary>
    [HttpPut("courses/{id:guid}/toggle-publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleCoursePublish(Guid id)
    {
        try
        {
            var isPublished = await _adminService.ToggleCoursePublishAsync(id);
            return Ok(new { message = $"Course is now {(isPublished ? "Published" : "Hidden (Draft)")}.", courseId = id, isPublished });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Soft delete course from catalog.
    /// </summary>
    [HttpDelete("courses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        try
        {
            await _adminService.DeleteCourseAsync(id);
            return Ok(new { message = "Course deleted successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Retrieve full history of financial orders, checkout transactions, and subscriptions.
    /// </summary>
    [HttpGet("orders")]
    [ProducesResponseType(typeof(List<AdminOrderListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _adminService.GetOrdersAsync();
        return Ok(orders);
    }

    /// <summary>
    /// Retrieve current Bunny Stream Video CDN settings with masked secret API key.
    /// </summary>
    [HttpGet("bunny-stream")]
    public IActionResult GetBunnyStreamSettings()
    {
        var config = _bunnyService.GetConfig();
        var safeConfig = new BunnyConfigDto
        {
            LibraryId = config.LibraryId,
            CdnHostname = config.CdnHostname,
            ApiKey = MaskApiKey(config.ApiKey)
        };
        return Ok(safeConfig);
    }

    /// <summary>
    /// Update Bunny Stream Video CDN settings.
    /// </summary>
    [HttpPut("bunny-stream")]
    public IActionResult UpdateBunnyStreamSettings([FromBody] BunnyConfigDto dto)
    {
        var current = _bunnyService.GetConfig();
        if (string.IsNullOrWhiteSpace(dto.ApiKey) || dto.ApiKey.Contains("****") || dto.ApiKey.Contains("*****"))
        {
            dto.ApiKey = current.ApiKey;
        }

        _bunnyService.UpdateConfig(dto);
        var updated = _bunnyService.GetConfig();
        return Ok(new 
        { 
            message = "Bunny Stream configuration updated successfully.", 
            config = new BunnyConfigDto
            {
                LibraryId = updated.LibraryId,
                CdnHostname = updated.CdnHostname,
                ApiKey = MaskApiKey(updated.ApiKey)
            } 
        });
    }

    private static string MaskApiKey(string? apiKey)
    {
        if (string.IsNullOrWhiteSpace(apiKey)) return string.Empty;
        var trimmed = apiKey.Trim();
        if (trimmed.Length <= 8) return "********";
        return $"{trimmed[..4]}****{trimmed[^4..]}";
    }

    /// <summary>
    /// Test live connection to Bunny Stream Video Library API.
    /// </summary>
    [HttpPost("bunny-stream/test")]
    public async Task<IActionResult> TestBunnyStreamConnection()
    {
        var result = await _bunnyService.TestConnectionAsync();
        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            totalVideos = result.TotalVideos
        });
    }
}
