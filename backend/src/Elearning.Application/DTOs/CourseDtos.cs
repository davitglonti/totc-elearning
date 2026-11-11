using Elearning.Domain.Enums;

namespace Elearning.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public int CoursesCount { get; set; }
}

public class CourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public string Level { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string? InstructorAvatar { get; set; }
    public Guid InstructorId { get; set; }
    public string InstructorEmail { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public int TotalDurationMinutes { get; set; }
    public int StudentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseDetailDto : CourseDto
{
    public List<SectionDto> Sections { get; set; } = new();
    public List<ReviewDto> RecentReviews { get; set; } = new();
    public bool IsEnrolled { get; set; }
}

public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public CourseLevel Level { get; set; } = CourseLevel.Beginner;
    public Guid CategoryId { get; set; }
}

public class UpdateCourseDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public decimal? Price { get; set; }
    public CourseLevel? Level { get; set; }
    public Guid? CategoryId { get; set; }
    public bool? IsPublished { get; set; }
}

public class CourseFilterParams
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public CourseLevel? Level { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } // "popular", "newest", "price_asc", "price_desc", "rating"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 9;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
