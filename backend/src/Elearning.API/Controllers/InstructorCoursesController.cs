using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Controllers;

/// <summary>
/// Authoring and analytics endpoints for certified instructors and platform administrators.
/// </summary>
[Authorize(Roles = "Instructor,Admin")]
[Route("api/instructor")]
public class InstructorCoursesController : BaseApiController
{
    private readonly ICourseService _courseService;
    private readonly IMediaService _mediaService;
    private readonly ElearningDbContext _context;

    public InstructorCoursesController(
        ICourseService courseService, 
        IMediaService mediaService,
        ElearningDbContext context)
    {
        _courseService = courseService;
        _mediaService = mediaService;
        _context = context;
    }

    /// <summary>
    /// Retrieve real course metrics, lectures count, enrollments, and curriculum for the authenticated instructor.
    /// </summary>
    [HttpGet("my-courses")]
    [ProducesResponseType(typeof(InstructorSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyInstructorCourses()
    {
        // Resolve instructor user: by CurrentUserId or fallback by email claim
        User? instructor = null;
        if (CurrentUserId.HasValue)
        {
            instructor = await _context.Users.FindAsync(CurrentUserId.Value);
        }
        if (instructor == null && !string.IsNullOrWhiteSpace(CurrentUserEmail))
        {
            instructor = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == CurrentUserEmail.ToLower());
        }

        if (instructor == null) return Unauthorized(new { message = "Session expired. Please log out and log in again." });

        var query = _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Instructor)
            .Include(c => c.Enrollments)
            .Include(c => c.Reviews)
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .AsQueryable();

        // If not Admin, show ONLY courses authored by this specific instructor
        if (instructor.Role != UserRole.Admin)
        {
            query = query.Where(c => c.InstructorId == instructor.Id);
        }

        var courses = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();

        var courseItems = courses.Select(c =>
        {
            var totalLessons = c.Sections.Sum(s => s.Lessons.Count);
            var studentsCount = c.Enrollments.Count;
            var revenue = studentsCount * c.Price;
            var avgRating = c.Reviews.Count > 0 ? c.Reviews.Average(r => r.Rating) : 5.0;

            return new InstructorCourseItemDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                ThumbnailUrl = c.ThumbnailUrl,
                Price = c.Price,
                Level = c.Level.ToString(),
                CategoryName = c.Category != null ? c.Category.Name : "General",
                CategoryId = c.CategoryId,
                InstructorId = c.InstructorId,
                InstructorName = c.Instructor?.FullName ?? instructor.FullName,
                InstructorEmail = c.Instructor?.Email ?? instructor.Email,
                IsPublished = c.IsPublished,
                ApprovalStatus = c.ApprovalStatus,
                RejectionReason = c.RejectionReason,
                SectionsCount = c.Sections.Count,
                LessonsCount = totalLessons,
                StudentsCount = studentsCount,
                Revenue = revenue,
                Rating = Math.Round(avgRating, 1),
                CreatedAt = c.CreatedAt
            };
        }).ToList();

        var totalCoursesCount = courseItems.Count;
        var totalLessonsCount = courseItems.Sum(c => c.LessonsCount);
        var totalStudentsCount = courseItems.Sum(c => c.StudentsCount);
        var totalRevenueAmount = courseItems.Sum(c => c.Revenue);
        var overallRating = courseItems.Count > 0 ? courseItems.Average(c => c.Rating) : 5.0;

        var summary = new InstructorSummaryDto
        {
            TotalCourses = totalCoursesCount,
            TotalLessons = totalLessonsCount,
            TotalStudents = totalStudentsCount,
            TotalRevenue = totalRevenueAmount,
            AverageRating = Math.Round(overallRating, 1),
            Courses = courseItems
        };

        return Ok(summary);
    }

    /// <summary>
    /// Create a complete course with modules and lecture video lessons in a single atomic action.
    /// </summary>
    [HttpPost("courses/full")]
    [ProducesResponseType(typeof(InstructorCourseItemDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFullCourse([FromBody] CreateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Course title is required." });

        // Resolve instructor user: by CurrentUserId or fallback by email claim
        User? instructor = null;
        if (CurrentUserId.HasValue)
        {
            instructor = await _context.Users.FindAsync(CurrentUserId.Value);
        }
        if (instructor == null && !string.IsNullOrWhiteSpace(CurrentUserEmail))
        {
            instructor = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == CurrentUserEmail.ToLower());
        }

        if (instructor == null)
        {
            return Unauthorized(new { message = "Session expired or user account not found. Please log out and log back in." });
        }

        // Verify or fallback category
        Category? category = null;
        if (dto.CategoryId != Guid.Empty)
        {
            category = await _context.Categories.FindAsync(dto.CategoryId);
        }
        if (category == null)
        {
            category = await _context.Categories.FirstOrDefaultAsync();
            if (category == null)
            {
                category = new Category { Name = "General Development", Slug = "development" };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
            }
        }

        // Check if role is admin
        var isUserAdmin = instructor.Role == UserRole.Admin || IsAdmin;
        var approvalStatus = isUserAdmin ? "Approved" : "PendingApproval";
        var isPublished = isUserAdmin ? dto.IsPublished : false;

        var course = new Course
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            ThumbnailUrl = string.IsNullOrWhiteSpace(dto.ThumbnailUrl) ? "/assets/explore_row_1.png" : dto.ThumbnailUrl.Trim(),
            Price = dto.Price >= 0 ? dto.Price : 49m,
            Level = dto.Level,
            CategoryId = category.Id,
            InstructorId = instructor.Id,
            ApprovalStatus = approvalStatus,
            IsPublished = isPublished,
            CreatedAt = DateTime.UtcNow
        };

        // Add sections and lessons if provided
        int sectionOrder = 1;
        if (dto.Sections != null && dto.Sections.Count > 0)
        {
            foreach (var sDto in dto.Sections)
            {
                var section = new Section
                {
                    Title = string.IsNullOrWhiteSpace(sDto.Title) ? $"Module {sectionOrder}" : sDto.Title.Trim(),
                    OrderIndex = sDto.OrderIndex > 0 ? sDto.OrderIndex : sectionOrder++
                };

                int lessonOrder = 1;
                if (sDto.Lessons != null && sDto.Lessons.Count > 0)
                {
                    foreach (var lDto in sDto.Lessons)
                    {
                        var lesson = new Lesson
                        {
                            Title = string.IsNullOrWhiteSpace(lDto.Title) ? $"Lesson {lessonOrder}" : lDto.Title.Trim(),
                            VideoUrl = string.IsNullOrWhiteSpace(lDto.VideoUrl) 
                                ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                                : lDto.VideoUrl.Trim(),
                            DurationMinutes = lDto.DurationMinutes > 0 ? lDto.DurationMinutes : 15,
                            ContentText = lDto.ContentText ?? string.Empty,
                            IsFreePreview = lDto.IsFreePreview,
                            LessonType = string.IsNullOrWhiteSpace(lDto.LessonType) ? "Video" : lDto.LessonType,
                            OrderIndex = lDto.OrderIndex > 0 ? lDto.OrderIndex : lessonOrder++
                        };

                        section.Lessons.Add(lesson);
                    }
                }

                course.Sections.Add(section);
            }
        }
        else
        {
            // Default initial introductory section and lesson
            var defaultSection = new Section
            {
                Title = "Module 1: Introduction & Foundations",
                OrderIndex = 1
            };
            defaultSection.Lessons.Add(new Lesson
            {
                Title = "Course Welcome & Overview",
                VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                DurationMinutes = 10,
                ContentText = "Welcome to the course. Here are the tools and prerequisites.",
                IsFreePreview = true,
                LessonType = "Video",
                OrderIndex = 1
            });
            course.Sections.Add(defaultSection);
        }

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var resultDto = new InstructorCourseItemDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            Level = course.Level.ToString(),
            CategoryName = category.Name,
            CategoryId = category.Id,
            IsPublished = course.IsPublished,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            SectionsCount = course.Sections.Count,
            LessonsCount = course.Sections.Sum(s => s.Lessons.Count),
            StudentsCount = 0,
            Revenue = 0,
            Rating = 5.0,
            CreatedAt = course.CreatedAt
        };

        return CreatedAtAction(nameof(CoursesController.GetCourseById), "Courses", new { id = course.Id }, resultDto);
    }

    /// <summary>
    /// Toggle publish status of instructor's course.
    /// </summary>
    [HttpPut("courses/{id:guid}/toggle-publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> TogglePublish(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound(new { message = "Course not found." });

        if (!IsAdmin && course.InstructorId != CurrentUserId.Value)
            return Forbid();

        course.IsPublished = !course.IsPublished;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Course is now {(course.IsPublished ? "Published" : "Draft")}.", isPublished = course.IsPublished });
    }

    /// <summary>
    /// Delete course authored by the instructor.
    /// </summary>
    [HttpDelete("courses/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        if (!IsAdmin && course.InstructorId != CurrentUserId.Value)
            return Forbid();

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Course deleted successfully." });
    }

    /// <summary>
    /// Create a new course draft.
    /// </summary>
    [HttpPost("courses")]
    [ProducesResponseType(typeof(CourseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var course = await _courseService.CreateCourseAsync(CurrentUserId.Value, dto);
        return CreatedAtAction(nameof(CoursesController.GetCourseById), "Courses", new { id = course.Id }, course);
    }

    /// <summary>
    /// Update existing course metadata.
    /// </summary>
    [HttpPut("courses/{id:guid}")]
    [ProducesResponseType(typeof(CourseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var updated = await _courseService.UpdateCourseAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(updated);
    }

    /// <summary>
    /// Add a new curriculum module / section to a course.
    /// </summary>
    [HttpPost("courses/{id:guid}/sections")]
    [ProducesResponseType(typeof(SectionDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddSection(Guid id, [FromBody] CreateSectionDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var section = await _courseService.AddSectionAsync(id, CurrentUserId.Value, IsAdmin, dto);
        return Ok(section);
    }

    /// <summary>
    /// Add a new lesson to a curriculum section.
    /// </summary>
    [HttpPost("sections/{sectionId:guid}/lessons")]
    [ProducesResponseType(typeof(LessonDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddLesson(Guid sectionId, [FromBody] CreateLessonDto dto)
    {
        if (!CurrentUserId.HasValue) return Unauthorized();

        var lesson = await _courseService.AddLessonAsync(sectionId, CurrentUserId.Value, IsAdmin, dto);
        return Ok(lesson);
    }

    /// <summary>
    /// Upload a video or image file to cloud/local media storage.
    /// </summary>
    [HttpPost("media/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadMedia(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        using var stream = file.OpenReadStream();
        var url = await _mediaService.UploadFileAsync(stream, file.FileName, file.ContentType);

        return Ok(new { url });
    }

    /// <summary>
    /// Retrieve full course curriculum, video URLs, and rejection feedback for editing.
    /// </summary>
    [HttpGet("courses/{id:guid}/full")]
    [ProducesResponseType(typeof(InstructorCourseEditDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFullCourseForEdit(Guid id)
    {
        // Resolve instructor
        User? instructor = null;
        if (CurrentUserId.HasValue)
        {
            instructor = await _context.Users.FindAsync(CurrentUserId.Value);
        }
        if (instructor == null && !string.IsNullOrWhiteSpace(CurrentUserEmail))
        {
            instructor = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == CurrentUserEmail.ToLower());
        }
        if (instructor == null) return Unauthorized();

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        if (instructor.Role != UserRole.Admin && course.InstructorId != instructor.Id)
            return Forbid();

        var dto = new InstructorCourseEditDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            Level = course.Level.ToString(),
            CategoryId = course.CategoryId,
            CategoryName = course.Category?.Name ?? "General",
            IsPublished = course.IsPublished,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            Sections = course.Sections.Select(s => new CreateFullSectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.Select(l => new CreateFullLessonDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    VideoUrl = l.VideoUrl,
                    DurationMinutes = l.DurationMinutes,
                    ContentText = l.ContentText,
                    IsFreePreview = l.IsFreePreview,
                    LessonType = l.LessonType ?? "Video",
                    OrderIndex = l.OrderIndex
                }).ToList()
            }).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Update existing course curriculum, add/remove modules, add/remove/edit video lessons, and resubmit for approval.
    /// </summary>
    [HttpPut("courses/{id:guid}/full")]
    [ProducesResponseType(typeof(InstructorCourseItemDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateFullCourse(Guid id, [FromBody] UpdateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Course title is required." });

        User? instructor = null;
        if (CurrentUserId.HasValue)
        {
            instructor = await _context.Users.FindAsync(CurrentUserId.Value);
        }
        if (instructor == null && !string.IsNullOrWhiteSpace(CurrentUserEmail))
        {
            instructor = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == CurrentUserEmail.ToLower());
        }
        if (instructor == null) return Unauthorized();

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return NotFound(new { message = "Course not found." });

        var isUserAdmin = instructor.Role == UserRole.Admin || IsAdmin;
        if (!isUserAdmin && course.InstructorId != instructor.Id)
            return Forbid();

        // Update Category
        if (dto.CategoryId != Guid.Empty && dto.CategoryId != course.CategoryId)
        {
            var cat = await _context.Categories.FindAsync(dto.CategoryId);
            if (cat != null) course.CategoryId = cat.Id;
        }

        // Update Course Metadata
        course.Title = dto.Title.Trim();
        course.Description = dto.Description?.Trim() ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(dto.ThumbnailUrl))
            course.ThumbnailUrl = dto.ThumbnailUrl.Trim();
        course.Price = dto.Price >= 0 ? dto.Price : 0m;
        course.Level = dto.Level;

        // If previously rejected or resubmit requested, put back in PendingApproval queue
        if (!isUserAdmin)
        {
            if (course.ApprovalStatus == "Rejected" || dto.ResubmitForReview)
            {
                course.ApprovalStatus = "PendingApproval";
                course.RejectionReason = null;
                course.ApprovedAt = null;
            }
        }
        else
        {
            course.IsPublished = dto.IsPublished;
        }

        // Load existing sections and lessons
        var existingSections = await _context.Sections
            .Include(s => s.Lessons)
            .Where(s => s.CourseId == id)
            .ToListAsync();

        // Sync Sections and Lessons
        var incomingSectionIds = dto.Sections
            .Where(s => s.Id.HasValue && s.Id.Value != Guid.Empty)
            .Select(s => s.Id!.Value)
            .ToHashSet();

        // Remove deleted sections
        var sectionsToRemove = existingSections.Where(s => !incomingSectionIds.Contains(s.Id)).ToList();
        _context.Sections.RemoveRange(sectionsToRemove);

        // Update or Add Sections
        int sOrder = 1;
        foreach (var sDto in dto.Sections)
        {
            Section? section = null;
            if (sDto.Id.HasValue && sDto.Id.Value != Guid.Empty)
            {
                section = existingSections.FirstOrDefault(s => s.Id == sDto.Id.Value);
            }

            if (section == null)
            {
                section = new Section
                {
                    CourseId = course.Id,
                    Title = string.IsNullOrWhiteSpace(sDto.Title) ? $"Module {sOrder}" : sDto.Title.Trim(),
                    OrderIndex = sDto.OrderIndex > 0 ? sDto.OrderIndex : sOrder
                };
                _context.Sections.Add(section);
            }
            else
            {
                section.Title = string.IsNullOrWhiteSpace(sDto.Title) ? $"Module {sOrder}" : sDto.Title.Trim();
                section.OrderIndex = sDto.OrderIndex > 0 ? sDto.OrderIndex : sOrder;
            }
            sOrder++;

            // Sync Lessons for this section
            var incomingLessonIds = sDto.Lessons
                .Where(l => l.Id.HasValue && l.Id.Value != Guid.Empty)
                .Select(l => l.Id!.Value)
                .ToHashSet();

            var lessonsToRemove = section.Lessons.Where(l => !incomingLessonIds.Contains(l.Id)).ToList();
            _context.Lessons.RemoveRange(lessonsToRemove);

            int lOrder = 1;
            foreach (var lDto in sDto.Lessons)
            {
                Lesson? lesson = null;
                if (lDto.Id.HasValue && lDto.Id.Value != Guid.Empty)
                {
                    lesson = section.Lessons.FirstOrDefault(l => l.Id == lDto.Id.Value);
                }

                if (lesson == null)
                {
                    lesson = new Lesson
                    {
                        SectionId = section.Id,
                        Title = string.IsNullOrWhiteSpace(lDto.Title) ? $"Lesson {lOrder}" : lDto.Title.Trim(),
                        VideoUrl = string.IsNullOrWhiteSpace(lDto.VideoUrl) 
                            ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                            : lDto.VideoUrl.Trim(),
                        DurationMinutes = lDto.DurationMinutes > 0 ? lDto.DurationMinutes : 15,
                        ContentText = lDto.ContentText ?? string.Empty,
                        IsFreePreview = lDto.IsFreePreview,
                        LessonType = string.IsNullOrWhiteSpace(lDto.LessonType) ? "Video" : lDto.LessonType,
                        OrderIndex = lDto.OrderIndex > 0 ? lDto.OrderIndex : lOrder
                    };
                    _context.Lessons.Add(lesson);
                }
                else
                {
                    lesson.Title = string.IsNullOrWhiteSpace(lDto.Title) ? $"Lesson {lOrder}" : lDto.Title.Trim();
                    lesson.VideoUrl = string.IsNullOrWhiteSpace(lDto.VideoUrl) 
                        ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                        : lDto.VideoUrl.Trim();
                    lesson.DurationMinutes = lDto.DurationMinutes > 0 ? lDto.DurationMinutes : 15;
                    lesson.ContentText = lDto.ContentText ?? string.Empty;
                    lesson.IsFreePreview = lDto.IsFreePreview;
                    lesson.LessonType = string.IsNullOrWhiteSpace(lDto.LessonType) ? "Video" : lDto.LessonType;
                    lesson.OrderIndex = lDto.OrderIndex > 0 ? lDto.OrderIndex : lOrder;
                }
                lOrder++;
            }
        }

        await _context.SaveChangesAsync();

        // Reload fresh counts
        var totalLessonsCount = await _context.Lessons.CountAsync(l => l.Section != null && l.Section.CourseId == course.Id);
        var totalSectionsCount = await _context.Sections.CountAsync(s => s.CourseId == course.Id);

        var resultDto = new InstructorCourseItemDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            ThumbnailUrl = course.ThumbnailUrl,
            Price = course.Price,
            Level = course.Level.ToString(),
            CategoryName = course.Category?.Name ?? "General",
            CategoryId = course.CategoryId,
            InstructorId = course.InstructorId,
            InstructorName = instructor.FullName,
            InstructorEmail = instructor.Email,
            IsPublished = course.IsPublished,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            SectionsCount = totalSectionsCount,
            LessonsCount = totalLessonsCount,
            StudentsCount = course.Enrollments.Count,
            Revenue = course.Enrollments.Count * course.Price,
            Rating = 5.0,
            CreatedAt = course.CreatedAt
        };

        return Ok(resultDto);
    }
}
