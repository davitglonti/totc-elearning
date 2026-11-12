using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Individual lesson within a course section.
/// </summary>
public class Lesson : BaseEntity
{
    public Guid SectionId { get; set; }
    public Section? Section { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; }
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; } = false;
    public int OrderIndex { get; set; }
    public string LessonType { get; set; } = "Video"; // "Video", "Quiz", "Assignment"
    public string? ResourcesJson { get; set; }

    // Navigation properties
    public Quiz? Quiz { get; set; }
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
}
