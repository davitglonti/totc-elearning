namespace Elearning.Domain.Entities;

/// <summary>
/// Individual lesson within a course section.
/// </summary>
public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SectionId { get; set; }
    public Section? Section { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; }
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; } = false;
    public int OrderIndex { get; set; }

    // Navigation properties
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
}
