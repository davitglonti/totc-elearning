using Elearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Data;

/// <summary>
/// Entity Framework Core DbContext for the TOTC E-Learning system.
/// </summary>
public class ElearningDbContext : DbContext
{
    public ElearningDbContext(DbContextOptions<ElearningDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<LessonProgress> LessonProgresses => Set<LessonProgress>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User indexes and constraints
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
        });

        // Course relationships
        modelBuilder.Entity<Course>(entity =>
        {
            entity.Property(c => c.Title).IsRequired().HasMaxLength(250);
            entity.Property(c => c.Price).HasPrecision(18, 2);

            entity.HasOne(c => c.Category)
                  .WithMany(cat => cat.Courses)
                  .HasForeignKey(c => c.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Instructor)
                  .WithMany(u => u.AuthoredCourses)
                  .HasForeignKey(c => c.InstructorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Section relationships
        modelBuilder.Entity<Section>(entity =>
        {
            entity.Property(s => s.Title).IsRequired().HasMaxLength(200);

            entity.HasOne(s => s.Course)
                  .WithMany(c => c.Sections)
                  .HasForeignKey(s => s.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Lesson relationships
        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.Property(l => l.Title).IsRequired().HasMaxLength(200);

            entity.HasOne(l => l.Section)
                  .WithMany(s => s.Lessons)
                  .HasForeignKey(l => l.SectionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Enrollment relationships
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // LessonProgress relationships
        modelBuilder.Entity<LessonProgress>(entity =>
        {
            entity.HasIndex(lp => new { lp.UserId, lp.LessonId }).IsUnique();

            entity.HasOne(lp => lp.User)
                  .WithMany(u => u.LessonProgresses)
                  .HasForeignKey(lp => lp.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(lp => lp.Lesson)
                  .WithMany(l => l.Progresses)
                  .HasForeignKey(lp => lp.LessonId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Review relationships
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Course)
                  .WithMany(c => c.Reviews)
                  .HasForeignKey(r => r.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Order relationships
        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Amount).HasPrecision(18, 2);

            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.Course)
                  .WithMany(c => c.Orders)
                  .HasForeignKey(o => o.CourseId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
