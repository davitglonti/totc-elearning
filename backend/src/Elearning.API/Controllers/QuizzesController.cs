using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers;

/// <summary>
/// Endpoints for interactive lesson quizzes and knowledge check assessments.
/// </summary>
[Authorize]
public class QuizzesController : BaseApiController
{
    private readonly ElearningDbContext _context;
    private readonly IEnrollmentService _enrollmentService;

    public QuizzesController(ElearningDbContext context, IEnrollmentService enrollmentService)
    {
        _context = context;
        _enrollmentService = enrollmentService;
    }

    /// <summary>
    /// Retrieve the interactive quiz for a specific lesson without exposing correct answers.
    /// </summary>
    [HttpGet("lesson/{lessonId:guid}")]
    [ProducesResponseType(typeof(QuizDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuizByLessonId(Guid lessonId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions.OrderBy(qu => qu.OrderIndex))
                .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(q => q.LessonId == lessonId);

        if (quiz == null)
            return NotFound(new { message = "No quiz configured for this lesson." });

        var dto = new QuizDto
        {
            Id = quiz.Id,
            LessonId = quiz.LessonId,
            Title = quiz.Title,
            Description = quiz.Description,
            PassingScorePercentage = quiz.PassingScorePercentage,
            Questions = quiz.Questions.Select(qu => new QuizQuestionDto
            {
                Id = qu.Id,
                QuestionText = qu.QuestionText,
                OrderIndex = qu.OrderIndex,
                Options = qu.Options.Select(o => new QuizOptionDto
                {
                    Id = o.Id,
                    OptionText = o.OptionText
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Submit quiz answers for scoring and automatic lesson completion.
    /// </summary>
    [HttpPost("{quizId:guid}/submit")]
    [ProducesResponseType(typeof(QuizSubmitResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitQuiz(Guid quizId, [FromBody] QuizSubmitRequestDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null)
            return NotFound(new { message = "Quiz not found." });

        var feedbacks = new List<QuestionFeedbackDto>();
        int correctCount = 0;

        foreach (var question in quiz.Questions)
        {
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
            dto.Answers.TryGetValue(question.Id, out var selectedOptionId);

            bool isCorrect = correctOption != null && selectedOptionId == correctOption.Id;
            if (isCorrect) correctCount++;

            feedbacks.Add(new QuestionFeedbackDto
            {
                QuestionId = question.Id,
                SelectedOptionId = selectedOptionId != Guid.Empty ? selectedOptionId : null,
                CorrectOptionId = correctOption?.Id ?? Guid.Empty,
                IsCorrect = isCorrect,
                Explanation = question.Explanation
            });
        }

        int total = quiz.Questions.Count;
        int scorePercentage = total > 0 ? (int)Math.Round((double)correctCount / total * 100) : 0;
        bool passed = scorePercentage >= quiz.PassingScorePercentage;

        // If the student passes the knowledge check, automatically complete the lesson in DB!
        if (passed && quiz.LessonId.HasValue)
        {
            await _enrollmentService.CompleteLessonAsync(quiz.LessonId.Value, CurrentUserId.Value, new CompleteLessonDto
            {
                MarkAsComplete = true,
                LastWatchedPositionSeconds = 0
            });
        }

        var result = new QuizSubmitResultDto
        {
            TotalQuestions = total,
            CorrectAnswersCount = correctCount,
            ScorePercentage = scorePercentage,
            Passed = passed,
            FeedbackMessage = passed
                ? $"🎉 Excellent work! You passed with {scorePercentage}% score and completed the lecture."
                : $"You scored {scorePercentage}%. Minimum required is {quiz.PassingScorePercentage}%. Review the lecture and try again!",
            QuestionFeedbacks = feedbacks
        };

        return Ok(result);
    }
}
