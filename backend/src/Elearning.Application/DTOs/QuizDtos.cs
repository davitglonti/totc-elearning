namespace Elearning.Application.DTOs;

public class QuizDto
{
    public Guid Id { get; set; }
    public Guid? LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PassingScorePercentage { get; set; } = 70;
    public List<QuizQuestionDto> Questions { get; set; } = new();
}

public class QuizQuestionDto
{
    public Guid Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<QuizOptionDto> Options { get; set; } = new();
}

public class QuizOptionDto
{
    public Guid Id { get; set; }
    public string OptionText { get; set; } = string.Empty;
}

public class QuizSubmitRequestDto
{
    public Dictionary<Guid, Guid> Answers { get; set; } = new();
}

public class QuizSubmitResultDto
{
    public int TotalQuestions { get; set; }
    public int CorrectAnswersCount { get; set; }
    public int ScorePercentage { get; set; }
    public bool Passed { get; set; }
    public string FeedbackMessage { get; set; } = string.Empty;
    public List<QuestionFeedbackDto> QuestionFeedbacks { get; set; } = new();
    public int AttemptsCount { get; set; }
    public bool IsInCooldown { get; set; }
    public int RemainingCooldownSeconds { get; set; }
}

public class QuestionFeedbackDto
{
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public Guid CorrectOptionId { get; set; }
    public bool IsCorrect { get; set; }
    public string Explanation { get; set; } = string.Empty;
}
