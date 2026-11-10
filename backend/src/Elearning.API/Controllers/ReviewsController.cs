using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for verified student reviews and ratings.
/// </summary>
public class ReviewsController : BaseApiController
{
    private readonly IEnrollmentService _enrollmentService;

    public ReviewsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    /// <summary>
    /// Get all reviews for a course.
    /// </summary>
    [HttpGet("/api/courses/{courseId:guid}/reviews")]
    [ProducesResponseType(typeof(List<ReviewDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(Guid courseId)
    {
        var reviews = await _enrollmentService.GetCourseReviewsAsync(courseId);
        return Ok(reviews);
    }

    /// <summary>
    /// Post a course review (enrolled students only).
    /// </summary>
    [Authorize]
    [HttpPost("/api/courses/{courseId:guid}/reviews")]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddReview(Guid courseId, [FromBody] CreateReviewDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var review = await _enrollmentService.AddCourseReviewAsync(courseId, CurrentUserId.Value, dto);
            return Ok(review);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
