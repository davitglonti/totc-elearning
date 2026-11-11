using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements course catalog querying, search, filtering, and authoring.
/// </summary>
public class CourseService : ICourseService
{
    private readonly ElearningDbContext _context;

    public CourseService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CourseDto>> GetCoursesAsync(CourseFilterParams filter)
    {
        var query = _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Sections).ThenInclude(s => s.Lessons)
            .Include(c => c.Reviews)
            .Include(c => c.Enrollments)
            .Where(c => c.IsPublished && c.ApprovalStatus == "Approved")
            .AsQueryable();

        // Search text in Title, Description, or Instructor
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(search) ||
                                     c.Description.ToLower().Contains(search) ||
                                     (c.Instructor != null && c.Instructor.FullName.ToLower().Contains(search)));
        }

        // Category filter (slug or name)
        if (!string.IsNullOrWhiteSpace(filter.Category) && filter.Category != "All")
        {
            var cat = filter.Category.Trim().ToLower();
            query = query.Where(c => c.Category != null && (c.Category.Slug.ToLower() == cat || c.Category.Name.ToLower() == cat));
        }

        // Level filter
        if (filter.Level.HasValue)
        {
            query = query.Where(c => c.Level == filter.Level.Value);
        }

        // Price range
        if (filter.MinPrice.HasValue)
            query = query.Where(c => c.Price >= filter.MinPrice.Value);
        if (filter.MaxPrice.HasValue)
            query = query.Where(c => c.Price <= filter.MaxPrice.Value);

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "newest" => query.OrderByDescending(c => c.CreatedAt),
            "price_asc" => query.OrderBy(c => c.Price),
            "price_desc" => query.OrderByDescending(c => c.Price),
            "rating" => query.OrderByDescending(c => c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0),
            _ => query.OrderByDescending(c => c.Enrollments.Count) // default "popular"
        };

        var totalCount = await query.CountAsync();
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return new PagedResult<CourseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CourseDetailDto?> GetCourseByIdAsync(Guid courseId, Guid? currentUserId)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
            .Include(c => c.Reviews.OrderByDescending(r => r.CreatedAt)).ThenInclude(r => r.User)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return null;

        var isEnrolled = false;
        if (currentUserId.HasValue)
        {
            isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == currentUserId.Value);
        }

        var dto = new CourseDetailDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            Level = course.Level.ToString(),
            CategoryName = course.Category?.Name ?? string.Empty,
            CategoryId = course.CategoryId,
            InstructorName = course.Instructor?.FullName ?? string.Empty,
            InstructorAvatar = course.Instructor?.AvatarUrl,
            InstructorId = course.InstructorId,
            AverageRating = course.Reviews.Any() ? Math.Round(course.Reviews.Average(r => r.Rating), 1) : 5.0,
            ReviewsCount = course.Reviews.Count,
            TotalDurationMinutes = course.Sections.SelectMany(s => s.Lessons).Sum(l => l.DurationMinutes),
            StudentsCount = course.Enrollments.Count,
            CreatedAt = course.CreatedAt,
            IsEnrolled = isEnrolled,
            Sections = course.Sections.Select(s => new SectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.Select(l => new LessonDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    VideoUrl = (isEnrolled || l.IsFreePreview) ? l.VideoUrl : null,
                    DurationMinutes = l.DurationMinutes,
                    ContentText = (isEnrolled || l.IsFreePreview) ? l.ContentText : null,
                    IsFreePreview = l.IsFreePreview,
                    OrderIndex = l.OrderIndex
                }).ToList()
            }).ToList(),
            RecentReviews = course.Reviews.Take(5).Select(r => new ReviewDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User?.FullName ?? "Student",
                UserAvatar = r.User?.AvatarUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList()
        };

        return dto;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                IconUrl = c.IconUrl,
                CoursesCount = c.Courses.Count(course => course.IsPublished)
            })
            .ToListAsync();
    }

    public async Task<CourseDto> CreateCourseAsync(Guid instructorId, CreateCourseDto dto)
    {
        var course = new Course
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            ThumbnailUrl = dto.ThumbnailUrl,
            Price = dto.Price,
            Level = dto.Level,
            CategoryId = dto.CategoryId,
            InstructorId = instructorId,
            IsPublished = true
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        await _context.Entry(course).Reference(c => c.Category).LoadAsync();
        await _context.Entry(course).Reference(c => c.Instructor).LoadAsync();

        return MapToDto(course);
    }

    public async Task<CourseDto> UpdateCourseAsync(Guid courseId, Guid instructorId, bool isAdmin, UpdateCourseDto dto)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        if (!isAdmin && course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("You are not authorized to edit this course.");

        if (!string.IsNullOrWhiteSpace(dto.Title)) course.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description)) course.Description = dto.Description.Trim();
        if (!string.IsNullOrWhiteSpace(dto.ThumbnailUrl)) course.ThumbnailUrl = dto.ThumbnailUrl.Trim();
        if (dto.Price.HasValue) course.Price = dto.Price.Value;
        if (dto.Level.HasValue) course.Level = dto.Level.Value;
        if (dto.CategoryId.HasValue) course.CategoryId = dto.CategoryId.Value;
        if (dto.IsPublished.HasValue) course.IsPublished = dto.IsPublished.Value;

        await _context.SaveChangesAsync();
        return MapToDto(course);
    }

    public async Task<SectionDto> AddSectionAsync(Guid courseId, Guid instructorId, bool isAdmin, CreateSectionDto dto)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        if (!isAdmin && course.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Not authorized to add sections to this course.");

        var section = new Section
        {
            CourseId = courseId,
            Title = dto.Title.Trim(),
            OrderIndex = dto.OrderIndex
        };

        _context.Sections.Add(section);
        await _context.SaveChangesAsync();

        return new SectionDto
        {
            Id = section.Id,
            Title = section.Title,
            OrderIndex = section.OrderIndex,
            Lessons = new List<LessonDto>()
        };
    }

    public async Task<LessonDto> AddLessonAsync(Guid sectionId, Guid instructorId, bool isAdmin, CreateLessonDto dto)
    {
        var section = await _context.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == sectionId);
        if (section == null)
            throw new KeyNotFoundException("Section not found.");

        if (!isAdmin && section.Course?.InstructorId != instructorId)
            throw new UnauthorizedAccessException("Not authorized to add lessons to this course.");

        var lesson = new Lesson
        {
            SectionId = sectionId,
            Title = dto.Title.Trim(),
            VideoUrl = dto.VideoUrl,
            DurationMinutes = dto.DurationMinutes,
            ContentText = dto.ContentText,
            IsFreePreview = dto.IsFreePreview,
            OrderIndex = dto.OrderIndex
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return new LessonDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            VideoUrl = lesson.VideoUrl,
            DurationMinutes = lesson.DurationMinutes,
            ContentText = lesson.ContentText,
            IsFreePreview = lesson.IsFreePreview,
            OrderIndex = lesson.OrderIndex
        };
    }

    private static CourseDto MapToDto(Course c)
    {
        return new CourseDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            ThumbnailUrl = c.ThumbnailUrl,
            Price = c.Price,
            Level = c.Level.ToString(),
            CategoryName = c.Category?.Name ?? string.Empty,
            CategoryId = c.CategoryId,
            InstructorName = c.Instructor?.FullName ?? string.Empty,
            InstructorAvatar = c.Instructor?.AvatarUrl,
            InstructorId = c.InstructorId,
            AverageRating = c.Reviews != null && c.Reviews.Any() ? Math.Round(c.Reviews.Average(r => r.Rating), 1) : 5.0,
            ReviewsCount = c.Reviews?.Count ?? 0,
            TotalDurationMinutes = c.Sections != null ? c.Sections.SelectMany(s => s.Lessons).Sum(l => l.DurationMinutes) : 0,
            StudentsCount = c.Enrollments?.Count ?? 0,
            CreatedAt = c.CreatedAt
        };
    }
}
