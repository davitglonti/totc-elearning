namespace Elearning.Application.DTOs;

public class SectionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
}

public class CreateSectionDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public class LessonDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; }
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateLessonDto
{
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; }
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; }
    public int OrderIndex { get; set; }
}

public class CompleteLessonDto
{
    public int LastWatchedPositionSeconds { get; set; }
    public bool MarkAsComplete { get; set; } = true;
}
