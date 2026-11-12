using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Course category (e.g. Design, Development, Business).
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }

    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
