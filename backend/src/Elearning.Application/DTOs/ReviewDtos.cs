using System.ComponentModel.DataAnnotations;

namespace Elearning.Application.DTOs;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required, MinLength(3)]
    public string Comment { get; set; } = string.Empty;
}
