using Elearning.Domain.Enums;

namespace Elearning.Application.DTOs;

public class InstructorSummaryDto
{
    public int TotalCourses { get; set; }
    public int TotalLessons { get; set; }
    public int TotalStudents { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public List<InstructorCourseItemDto> Courses { get; set; } = new();
}

public class InstructorCourseItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public string Level { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorEmail { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public string ApprovalStatus { get; set; } = "Approved";
    public string? RejectionReason { get; set; }
    public int SectionsCount { get; set; }
    public int LessonsCount { get; set; }
    public int StudentsCount { get; set; }
    public decimal Revenue { get; set; }
    public double Rating { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFullCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public CourseLevel Level { get; set; } = CourseLevel.Beginner;
    public Guid CategoryId { get; set; }
    public bool IsPublished { get; set; } = true;
    public List<CreateFullSectionDto> Sections { get; set; } = new();
}

public class CreateFullSectionDto
{
    public Guid? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<CreateFullLessonDto> Lessons { get; set; } = new();
}

public class CreateFullLessonDto
{
    public Guid? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public int DurationMinutes { get; set; } = 15;
    public string? ContentText { get; set; }
    public bool IsFreePreview { get; set; } = false;
    public string LessonType { get; set; } = "Video";
    public int OrderIndex { get; set; }
}

public class UpdateFullCourseDto : CreateFullCourseDto
{
    public bool ResubmitForReview { get; set; } = true;
}

public class InstructorCourseEditDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public string Level { get; set; } = "Beginner";
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public string ApprovalStatus { get; set; } = "Approved";
    public string? RejectionReason { get; set; }
    public List<CreateFullSectionDto> Sections { get; set; } = new();
}
