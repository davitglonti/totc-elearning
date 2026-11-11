using System.ComponentModel.DataAnnotations;
using Elearning.Domain.Enums;

namespace Elearning.Application.DTOs;

public class RegisterDto
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Student;

    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? Education { get; set; }
    public string? Experience { get; set; }
    public string? Website { get; set; }
    public string? AvatarUrl { get; set; }
}

public class LoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class GoogleAuthDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }
    public string? Credential { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? Education { get; set; }
    public string? Experience { get; set; }
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserProfileDto User { get; set; } = null!;
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? Education { get; set; }
    public string? Experience { get; set; }
    public string? Website { get; set; }
    public bool IsSubscribed { get; set; }
    public string? SubscriptionPlan { get; set; }
    public DateTime? SubscriptionExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileDto
{
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? Education { get; set; }
    public string? Experience { get; set; }
    public string? Website { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

public class InstructorPublicProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "Instructor";
    public string? AvatarUrl { get; set; }
    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? Education { get; set; }
    public string? Experience { get; set; }
    public string? Website { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CoursesCount { get; set; }
    public int StudentsCount { get; set; }
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public List<CourseDto> AuthoredCourses { get; set; } = new();
}
