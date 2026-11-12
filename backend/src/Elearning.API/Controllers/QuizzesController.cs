using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for interactive lesson quizzes and knowledge check assessments with anti-cheat cooldowns.
/// </summary>
[Authorize]
public class QuizzesController : BaseApiController
{
    private readonly IQuizService _quizService;

    public QuizzesController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    /// <summary>
    /// Retrieve the interactive quiz for a specific lesson without exposing correct answers.
    /// </summary>
    [HttpGet("lesson/{lessonId:guid}")]
    [ProducesResponseType(typeof(QuizDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuizByLessonId(Guid lessonId)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var quiz = await _quizService.GetQuizByLessonIdAsync(lessonId, CurrentUserId.Value);
            if (quiz == null)
                return NotFound(new { message = "No quiz configured for this lesson." });

            return Ok(quiz);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Submit quiz answers for scoring, attempt tracking, and automatic lecture completion.
    /// Returns HTTP 429 Too Many Requests if student is locked under exam cooldown.
    /// </summary>
    [HttpPost("{quizId:guid}/submit")]
    [ProducesResponseType(typeof(QuizSubmitResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> SubmitQuiz(Guid quizId, [FromBody] QuizSubmitRequestDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        try
        {
            var result = await _quizService.SubmitQuizAsync(quizId, CurrentUserId.Value, dto);
            return Ok(result);
        }
        catch (QuizCooldownException ex)
        {
            Response.Headers.Append("Retry-After", ex.RemainingCooldownSeconds.ToString());
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                error = "CooldownActive",
                message = ex.Message,
                remainingSeconds = ex.RemainingCooldownSeconds,
                retryAfter = ex.RemainingCooldownSeconds
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
