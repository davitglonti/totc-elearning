using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents an interactive quiz or assessment associated with a lesson or curriculum section.
/// </summary>
public class Quiz : BaseEntity
{
    public Guid? LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public Guid? SectionId { get; set; }
    public Section? Section { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PassingScorePercentage { get; set; } = 70;

    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}

/// <summary>
/// Represents a multiple-choice question within a quiz.
/// </summary>
public class QuizQuestion : BaseEntity
{
    public Guid QuizId { get; set; }
    public Quiz? Quiz { get; set; }

    public string QuestionText { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public ICollection<QuizOption> Options { get; set; } = new List<QuizOption>();
}

/// <summary>
/// Represents a potential answer option for a multiple-choice quiz question.
/// </summary>
public class QuizOption : BaseEntity
{
    public Guid QuizQuestionId { get; set; }
    public QuizQuestion? QuizQuestion { get; set; }

    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
