namespace Elearning.Domain.Entities;

/// <summary>
/// Course category (e.g. Design, Development, Business).
/// </summary>
public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconUrl { get; set; }

    // Navigation properties
    public ICollection<Course> Courses { get; set; } = new List<Course>();
}
