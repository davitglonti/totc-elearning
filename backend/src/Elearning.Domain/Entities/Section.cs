namespace Elearning.Domain.Entities;

/// <summary>
/// Course curriculum module / section (e.g., Module 1, Module 2).
/// </summary>
public class Section
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Course? Course { get; set; }

    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Navigation properties
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
