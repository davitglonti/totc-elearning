using System.Security.Cryptography;
using System.Text;
using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements user registration, login, Google authentication, profile services, and password recovery.
/// </summary>
public class AuthService : IAuthService
{
    private readonly ElearningDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ElearningDbContext context,
        ITokenService tokenService,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Constructor overload ensuring backwards compatibility with existing unit test suites.
    /// </summary>
    public AuthService(ElearningDbContext context, ITokenService tokenService, IConfiguration configuration)
        : this(context, tokenService, configuration, new NullEmailService(), NullLogger<AuthService>.Instance)
    {
    }

    private class NullEmailService : IEmailService
    {
        public Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string recipientName) => Task.CompletedTask;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Enforce role restriction: Only Student (0) or Instructor (1) are permitted for public self-registration
        if (dto.Role == UserRole.Admin || (int)dto.Role > 1 || (int)dto.Role < 0)
        {
            throw new InvalidOperationException("Direct registration as Administrator is strictly prohibited. Administrator accounts can only be provisioned via database seed or by an existing Administrator from the Admin panel.");
        }

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
        // 1. Enforce that Administrator accounts cannot be self-provisioned via Google
        if (dto.Role == UserRole.Admin || (int)dto.Role > 1 || (int)dto.Role < 0)
        {
            throw new InvalidOperationException("Direct registration as Administrator is strictly prohibited.");
        }

        if (string.IsNullOrWhiteSpace(dto.IdToken))
        {
            throw new ArgumentException("Google ID token is required.");
        }

        // 2. Cryptographically validate Google ID Token signature with Google's official public keys
        var settings = new GoogleJsonWebSignature.ValidationSettings();
        var expectedClientId = _configuration["Google:ClientId"];
        if (!string.IsNullOrWhiteSpace(expectedClientId))
        {
            settings.Audience = new[] { expectedClientId.Trim() };
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken.Trim(), settings);
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException($"Invalid Google authentication token: {ex.Message}");
        }

        if (payload == null || string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new UnauthorizedAccessException("Google authentication failed: Email address could not be verified from token payload.");
        }

        // Enforce that the user's email is verified by Google to prevent unverified account takeover
        if (!payload.EmailVerified)
        {
            throw new UnauthorizedAccessException("Google authentication failed: The email address is not verified by Google.");
        }

        var verifiedEmail = payload.Email.Trim().ToLower();
        var verifiedFullName = !string.IsNullOrWhiteSpace(payload.Name) 
            ? payload.Name.Trim() 
            : $"{payload.GivenName} {payload.FamilyName}".Trim();
        if (string.IsNullOrWhiteSpace(verifiedFullName)) verifiedFullName = "Google User";

        var verifiedAvatar = payload.Picture;

        // 3. Find existing user or register new user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == verifiedEmail);

        if (user == null)
        {
            // Register new Student or Instructor
            var defaultAvatar = dto.Role == UserRole.Instructor
                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                : "/assets/testimonial_avatar.png";

            user = new User
            {
                FullName = verifiedFullName,
                Email = verifiedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                Role = dto.Role,
                AvatarUrl = !string.IsNullOrWhiteSpace(verifiedAvatar) ? verifiedAvatar : defaultAvatar,
                Headline = dto.Role == UserRole.Instructor ? dto.Headline?.Trim() : null,
                Bio = dto.Role == UserRole.Instructor ? dto.Bio?.Trim() : null,
                Education = dto.Role == UserRole.Instructor ? dto.Education?.Trim() : null,
                Experience = dto.Role == UserRole.Instructor ? dto.Experience?.Trim() : null
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            // Existing user (Student, Instructor, or Admin) signs in securely
            if (!string.IsNullOrWhiteSpace(verifiedAvatar) && (string.IsNullOrWhiteSpace(user.AvatarUrl) || user.AvatarUrl == "/assets/testimonial_avatar.png"))
            {
                user.AvatarUrl = verifiedAvatar;
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

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            return;
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            // Anti-enumeration: Silent return ensures attackers cannot harvest valid email addresses
            _logger.LogInformation("[AuthService] Password reset requested for non-existent email: {Email}", normalizedEmail);
            return;
        }

        // Generate cryptographically secure 32-byte random token
        var tokenBytes = new byte[32];
        RandomNumberGenerator.Fill(tokenBytes);
        var rawToken = Convert.ToHexString(tokenBytes).ToLowerInvariant();

        // Store SHA-256 hash in database with strict 30-minute UTC expiry
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        user.PasswordResetTokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Dispatch transactional reset email
        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, rawToken, user.FullName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AuthService] Error occurred while sending password reset email to {Email}", user.Email);
        }
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
        {
            throw new InvalidOperationException("აღდგენის ტოკენი არასწორია ან ვადაგასულია.");
        }

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
        {
            throw new InvalidOperationException("ახალი პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.");
        }

        // Compute SHA-256 hash of incoming raw token
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(dto.Token.Trim()))).ToLowerInvariant();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetTokenHash == tokenHash);
        if (user == null || !user.PasswordResetTokenExpiresAt.HasValue || user.PasswordResetTokenExpiresAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("აღდგენის ტოკენი არასწორია ან ვადაგასულია.");
        }

        // Apply new hashed password using BCrypt and invalidate one-time reset token
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("[AuthService] Password reset successfully completed for user {UserId} ({Email})", user.Id, user.Email);
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
