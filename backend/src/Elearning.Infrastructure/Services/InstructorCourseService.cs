using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements instructor course authoring, multi-section/lesson curriculum orchestration,
/// moderation workflow gating, and instructor performance summaries.
/// </summary>
public class InstructorCourseService : IInstructorCourseService
{
    private readonly ElearningDbContext _context;

    public InstructorCourseService(ElearningDbContext context)
    {
        _context = context;
    }

    public async Task<InstructorSummaryDto> GetMyInstructorCoursesAsync(Guid userId, string? userEmail)
    {
        var instructor = await ResolveInstructorAsync(userId, userEmail);

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

        return new InstructorSummaryDto
        {
            TotalCourses = totalCoursesCount,
            TotalLessons = totalLessonsCount,
            TotalStudents = totalStudentsCount,
            TotalRevenue = totalRevenueAmount,
            AverageRating = Math.Round(overallRating, 1),
            Courses = courseItems
        };
    }

    public async Task<InstructorCourseItemDto> CreateFullCourseAsync(
        Guid userId, 
        string? userEmail, 
        bool isAdmin, 
        CreateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Course title is required.");

        var instructor = await ResolveInstructorAsync(userId, userEmail);

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

        var isUserAdmin = instructor.Role == UserRole.Admin || isAdmin;
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
            IsOpenAccess = dto.IsOpenAccess,
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
                            OrderIndex = lDto.OrderIndex > 0 ? lDto.OrderIndex : lessonOrder++,
                            ResourcesJson = lDto.Resources != null && lDto.Resources.Count > 0 
                                ? System.Text.Json.JsonSerializer.Serialize(lDto.Resources) 
                                : null
                        };

                        if (lDto.Quiz != null && lDto.Quiz.Questions != null && lDto.Quiz.Questions.Count > 0)
                        {
                            var quiz = new Quiz
                            {
                                LessonId = lesson.Id,
                                Title = string.IsNullOrWhiteSpace(lDto.Quiz.Title) ? $"{lesson.Title} Quiz" : lDto.Quiz.Title.Trim(),
                                Description = lDto.Quiz.Description ?? "Test your understanding of this lecture.",
                                PassingScorePercentage = lDto.Quiz.PassingScorePercentage > 0 ? lDto.Quiz.PassingScorePercentage : 70
                            };

                            int qIdx = 1;
                            foreach (var qDto in lDto.Quiz.Questions)
                            {
                                var question = new QuizQuestion
                                {
                                    QuizId = quiz.Id,
                                    QuestionText = qDto.QuestionText.Trim(),
                                    Explanation = qDto.Explanation ?? string.Empty,
                                    OrderIndex = qIdx++
                                };

                                foreach (var optDto in qDto.Options)
                                {
                                    question.Options.Add(new QuizOption
                                    {
                                        QuizQuestionId = question.Id,
                                        OptionText = optDto.OptionText.Trim(),
                                        IsCorrect = optDto.IsCorrect
                                    });
                                }

                                quiz.Questions.Add(question);
                            }

                            lesson.Quiz = quiz;
                        }

                        section.Lessons.Add(lesson);
                    }
                }

                course.Sections.Add(section);
            }
        }
        else
        {
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

        return new InstructorCourseItemDto
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
            IsOpenAccess = course.IsOpenAccess,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            SectionsCount = course.Sections.Count,
            LessonsCount = course.Sections.Sum(s => s.Lessons.Count),
            StudentsCount = 0,
            Revenue = 0,
            Rating = 5.0,
            CreatedAt = course.CreatedAt
        };
    }

    public async Task<(bool IsPublished, string Message)> TogglePublishAsync(Guid courseId, Guid userId, bool isAdmin)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        if (!isAdmin && course.InstructorId != userId)
            throw new UnauthorizedAccessException("You are not authorized to modify this course.");

        // Enforce moderation approval guard: instructors cannot publish unapproved or rejected courses
        if (!course.IsPublished && !isAdmin && course.ApprovalStatus != "Approved")
        {
            throw new InvalidOperationException($"Course cannot be published until approved by an administrator. Current status: '{course.ApprovalStatus}'.");
        }

        course.IsPublished = !course.IsPublished;
        await _context.SaveChangesAsync();

        var stateText = course.IsPublished ? "Published" : "Draft";
        return (course.IsPublished, $"Course is now {stateText}.");
    }

    public async Task DeleteCourseAsync(Guid courseId, Guid userId, bool isAdmin)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        if (!isAdmin && course.InstructorId != userId)
            throw new UnauthorizedAccessException("You are not authorized to delete this course.");

        // Soft delete to protect relational consistency with existing orders and progress
        course.IsDeleted = true;
        course.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<InstructorCourseEditDto> GetFullCourseForEditAsync(
        Guid courseId, 
        Guid userId, 
        string? userEmail, 
        bool isAdmin)
    {
        var instructor = await ResolveInstructorAsync(userId, userEmail);

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Sections.OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.OrderIndex))
                    .ThenInclude(l => l.Quiz!)
                        .ThenInclude(q => q.Questions.OrderBy(qu => qu.OrderIndex))
                            .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        if (instructor.Role != UserRole.Admin && !isAdmin && course.InstructorId != instructor.Id)
            throw new UnauthorizedAccessException("You are not authorized to edit this course.");

        return new InstructorCourseEditDto
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
            IsOpenAccess = course.IsOpenAccess,
            ApprovalStatus = course.ApprovalStatus,
            RejectionReason = course.RejectionReason,
            Sections = course.Sections.Select(s => new CreateFullSectionDto
            {
                Id = s.Id,
                Title = s.Title,
                OrderIndex = s.OrderIndex,
                Lessons = s.Lessons.Select(l =>
                {
                    List<LessonResourceDto> resList = new();
                    if (!string.IsNullOrWhiteSpace(l.ResourcesJson))
                    {
                        try
                        {
                            resList = System.Text.Json.JsonSerializer.Deserialize<List<LessonResourceDto>>(
                                l.ResourcesJson,
                                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                        }
                        catch { }
                    }

                    CreateLessonQuizDto? quizDto = null;
                    if (l.Quiz != null)
                    {
                        quizDto = new CreateLessonQuizDto
                        {
                            Id = l.Quiz.Id,
                            Title = l.Quiz.Title,
                            Description = l.Quiz.Description,
                            PassingScorePercentage = l.Quiz.PassingScorePercentage,
                            Questions = l.Quiz.Questions.Select(qu => new CreateQuizQuestionDto
                            {
                                Id = qu.Id,
                                QuestionText = qu.QuestionText,
                                Explanation = qu.Explanation,
                                OrderIndex = qu.OrderIndex,
                                Options = qu.Options.Select(o => new CreateQuizOptionDto
                                {
                                    Id = o.Id,
                                    OptionText = o.OptionText,
                                    IsCorrect = o.IsCorrect
                                }).ToList()
                            }).ToList()
                        };
                    }

                    return new CreateFullLessonDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        VideoUrl = l.VideoUrl,
                        DurationMinutes = l.DurationMinutes,
                        ContentText = l.ContentText,
                        IsFreePreview = l.IsFreePreview,
                        LessonType = l.LessonType ?? "Video",
                        OrderIndex = l.OrderIndex,
                        Resources = resList,
                        Quiz = quizDto
                    };
                }).ToList()
            }).ToList()
        };
    }

    public async Task<InstructorCourseItemDto> UpdateFullCourseAsync(
        Guid courseId, 
        Guid userId, 
        string? userEmail, 
        bool isAdmin, 
        UpdateFullCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Course title is required.");

        var instructor = await ResolveInstructorAsync(userId, userEmail);

        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null)
            throw new KeyNotFoundException("Course not found.");

        var isUserAdmin = instructor.Role == UserRole.Admin || isAdmin;
        if (!isUserAdmin && course.InstructorId != instructor.Id)
            throw new UnauthorizedAccessException("You are not authorized to update this course.");

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
        course.IsOpenAccess = dto.IsOpenAccess;

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
                .ThenInclude(l => l.Quiz!)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(qu => qu.Options)
            .Where(s => s.CourseId == courseId)
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
                        OrderIndex = lDto.OrderIndex > 0 ? lDto.OrderIndex : lOrder,
                        ResourcesJson = lDto.Resources != null && lDto.Resources.Count > 0 
                            ? System.Text.Json.JsonSerializer.Serialize(lDto.Resources) 
                            : null
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
                    lesson.ResourcesJson = lDto.Resources != null && lDto.Resources.Count > 0 
                        ? System.Text.Json.JsonSerializer.Serialize(lDto.Resources) 
                        : null;
                }

                if (lDto.Quiz != null && lDto.Quiz.Questions != null && lDto.Quiz.Questions.Count > 0)
                {
                    if (lesson.Quiz == null)
                    {
                        lesson.Quiz = new Quiz
                        {
                            LessonId = lesson.Id,
                            Title = string.IsNullOrWhiteSpace(lDto.Quiz.Title) ? $"{lesson.Title} Quiz" : lDto.Quiz.Title.Trim(),
                            Description = lDto.Quiz.Description ?? "Test your understanding of this lecture.",
                            PassingScorePercentage = lDto.Quiz.PassingScorePercentage > 0 ? lDto.Quiz.PassingScorePercentage : 70
                        };
                        _context.Quizzes.Add(lesson.Quiz);
                    }
                    else
                    {
                        lesson.Quiz.Title = string.IsNullOrWhiteSpace(lDto.Quiz.Title) ? $"{lesson.Title} Quiz" : lDto.Quiz.Title.Trim();
                        lesson.Quiz.Description = lDto.Quiz.Description ?? "Test your understanding of this lecture.";
                        lesson.Quiz.PassingScorePercentage = lDto.Quiz.PassingScorePercentage > 0 ? lDto.Quiz.PassingScorePercentage : 70;

                        var existingQuestions = lesson.Quiz.Questions.ToList();
                        foreach (var eq in existingQuestions)
                        {
                            _context.QuizOptions.RemoveRange(eq.Options);
                        }
                        _context.QuizQuestions.RemoveRange(existingQuestions);
                        lesson.Quiz.Questions.Clear();
                    }

                    int qIdx = 1;
                    foreach (var qDto in lDto.Quiz.Questions)
                    {
                        var question = new QuizQuestion
                        {
                            QuizId = lesson.Quiz.Id,
                            QuestionText = qDto.QuestionText.Trim(),
                            Explanation = qDto.Explanation ?? string.Empty,
                            OrderIndex = qIdx++
                        };

                        foreach (var optDto in qDto.Options)
                        {
                            question.Options.Add(new QuizOption
                            {
                                QuizQuestionId = question.Id,
                                OptionText = optDto.OptionText.Trim(),
                                IsCorrect = optDto.IsCorrect
                            });
                        }
                        lesson.Quiz.Questions.Add(question);
                    }
                }
                else if (lesson.Quiz != null)
                {
                    var existingQuestions = lesson.Quiz.Questions.ToList();
                    foreach (var eq in existingQuestions)
                    {
                        _context.QuizOptions.RemoveRange(eq.Options);
                    }
                    _context.QuizQuestions.RemoveRange(existingQuestions);
                    _context.Quizzes.Remove(lesson.Quiz);
                    lesson.Quiz = null;
                }
                lOrder++;
            }
        }

        await _context.SaveChangesAsync();

        var totalLessonsCount = await _context.Lessons.CountAsync(l => l.Section != null && l.Section.CourseId == course.Id);
        var totalSectionsCount = await _context.Sections.CountAsync(s => s.CourseId == course.Id);

        return new InstructorCourseItemDto
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
    }

    private async Task<User> ResolveInstructorAsync(Guid userId, string? userEmail)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null && !string.IsNullOrWhiteSpace(userEmail))
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());
        }

        if (user == null)
        {
            throw new UnauthorizedAccessException("Session expired or user account not found. Please log out and log back in.");
        }

        return user;
    }
}
