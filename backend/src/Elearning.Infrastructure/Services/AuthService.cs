using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements user registration, login, Google authentication, and profile services.
/// </summary>
public class AuthService : IAuthService
{
    private readonly ElearningDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(ElearningDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (existing)
        {
            throw new InvalidOperationException("A user with this email address already exists.");
        }

        var defaultAvatar = dto.Role == UserRole.Instructor
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            : "/assets/testimonial_avatar.png";

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            AvatarUrl = !string.IsNullOrWhiteSpace(dto.AvatarUrl) ? dto.AvatarUrl.Trim() : defaultAvatar,
            Headline = dto.Headline?.Trim(),
            Bio = dto.Bio?.Trim(),
            Education = dto.Education?.Trim(),
            Experience = dto.Experience?.Trim(),
            Website = dto.Website?.Trim()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token,
            User = MapToProfile(user)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email address or password.");
        }

        var token = _tokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token,
            User = MapToProfile(user)
        };
    }

    public async Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null)
        {
            user = new User
            {
                FullName = string.IsNullOrWhiteSpace(dto.FullName) ? "Google User" : dto.FullName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                Role = dto.Role,
                AvatarUrl = !string.IsNullOrWhiteSpace(dto.AvatarUrl) 
                    ? dto.AvatarUrl.Trim() 
                    : (dto.Role == UserRole.Instructor ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" : "/assets/testimonial_avatar.png"),
                Headline = dto.Headline?.Trim(),
                Bio = dto.Bio?.Trim(),
                Education = dto.Education?.Trim(),
                Experience = dto.Experience?.Trim()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl) && (string.IsNullOrWhiteSpace(user.AvatarUrl) || user.AvatarUrl == "/assets/testimonial_avatar.png"))
            {
                user.AvatarUrl = dto.AvatarUrl.Trim();
                await _context.SaveChangesAsync();
            }
        }

        var token = _tokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            Token = token,
            User = MapToProfile(user)
        };
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User profile not found.");
        }

        return MapToProfile(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        if (!string.IsNullOrWhiteSpace(dto.FullName))
            user.FullName = dto.FullName.Trim();

        if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            user.AvatarUrl = dto.AvatarUrl.Trim();

        if (dto.Headline != null)
            user.Headline = dto.Headline.Trim();

        if (dto.Bio != null)
            user.Bio = dto.Bio.Trim();

        if (dto.Education != null)
            user.Education = dto.Education.Trim();

        if (dto.Experience != null)
            user.Experience = dto.Experience.Trim();

        if (dto.Website != null)
            user.Website = dto.Website.Trim();

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                throw new InvalidOperationException("Current password is incorrect.");
            }
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await _context.SaveChangesAsync();
        return MapToProfile(user);
    }

    public async Task<InstructorPublicProfileDto> GetInstructorPublicProfileAsync(string idOrName)
    {
        var cleanTerm = (idOrName ?? string.Empty).Trim().ToLower();
        User? user = null;

        if (Guid.TryParse(idOrName, out var guidId))
        {
            user = await _context.Users
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Category)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Reviews)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Enrollments)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(u => u.Id == guidId);
        }

        if (user == null)
        {
            user = await _context.Users
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Category)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Reviews)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Enrollments)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(u => u.FullName.ToLower() == cleanTerm || u.Email.ToLower() == cleanTerm);
        }

        // Fuzzy fallback: e.g. "sophia" or "lina" or "marcus" in full name
        if (user == null && cleanTerm.Length >= 3)
        {
            user = await _context.Users
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Category)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Reviews)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Enrollments)
                .Include(u => u.AuthoredCourses)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)
                .FirstOrDefaultAsync(u => u.FullName.ToLower().Contains(cleanTerm));
        }

        if (user == null)
        {
            throw new KeyNotFoundException($"Instructor '{idOrName}' was not found.");
        }

        var authored = user.AuthoredCourses.ToList();
        var allReviews = authored.SelectMany(c => c.Reviews).ToList();
        var totalStudents = authored.Sum(c => c.Enrollments.Count);
        var avgRating = allReviews.Any() ? Math.Round(allReviews.Average(r => r.Rating), 1) : 4.9;

        var courseDtos = authored.Select(c => new CourseDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            ThumbnailUrl = c.ThumbnailUrl,
            Price = c.Price,
            Level = c.Level.ToString(),
            CategoryName = c.Category?.Name ?? "General",
            CategoryId = c.CategoryId,
            InstructorName = user.FullName,
            InstructorAvatar = user.AvatarUrl,
            InstructorId = user.Id,
            InstructorEmail = user.Email,
            AverageRating = c.Reviews.Any() ? Math.Round(c.Reviews.Average(r => r.Rating), 1) : 5.0,
            ReviewsCount = c.Reviews.Count,
            TotalDurationMinutes = c.Sections.SelectMany(s => s.Lessons).Sum(l => l.DurationMinutes),
            StudentsCount = c.Enrollments.Count,
            CreatedAt = c.CreatedAt
        }).ToList();

        return new InstructorPublicProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            Headline = !string.IsNullOrWhiteSpace(user.Headline) 
                ? user.Headline 
                : "Principal EdTech Instructor & Curriculum Specialist",
            Bio = !string.IsNullOrWhiteSpace(user.Bio) 
                ? user.Bio 
                : "Passionate educator with years of industry and academic experience empowering students with hands-on, modern practical knowledge.",
            Education = !string.IsNullOrWhiteSpace(user.Education)
                ? user.Education
                : "M.S. in Computer Science & Applied Information Systems",
            Experience = !string.IsNullOrWhiteSpace(user.Experience)
                ? user.Experience
                : "10+ years leading cross-functional engineering teams, mentoring students, and designing interactive curricula.",
            Website = user.Website,
            CreatedAt = user.CreatedAt,
            CoursesCount = authored.Count,
            StudentsCount = totalStudents,
            AverageRating = avgRating,
            ReviewsCount = allReviews.Count,
            AuthoredCourses = courseDtos
        };
    }

    private static UserProfileDto MapToProfile(User user)
    {
        return new UserProfileDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            AvatarUrl = user.AvatarUrl,
            Headline = user.Headline,
            Bio = user.Bio,
            Education = user.Education,
            Experience = user.Experience,
            Website = user.Website,
            IsSubscribed = user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow),
            SubscriptionPlan = user.SubscriptionPlan,
            SubscriptionExpiresAt = user.SubscriptionExpiresAt,
            CreatedAt = user.CreatedAt
        };
    }
}
