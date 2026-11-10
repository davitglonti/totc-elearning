namespace Elearning.Application.DTOs;

public class MyCourseDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public int CompletedLessonsCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public int ProgressPercentage { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsProAccess { get; set; }
}

public class CourseLearnDto
{
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public List<SectionLearnDto> Sections { get; set; } = new();
}

public class SectionLearnDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<LessonLearnDto> Lessons { get; set; } = new();
}

public class LessonLearnDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; }
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; }
    public int OrderIndex { get; set; }
    public bool IsCompleted { get; set; }
    public int LastWatchedPositionSeconds { get; set; }
}
