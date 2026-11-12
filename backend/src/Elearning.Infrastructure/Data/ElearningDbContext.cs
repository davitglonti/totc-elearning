using System.Linq.Expressions;
using Elearning.Domain.Common;
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
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizOption> QuizOptions => Set<QuizOption>();
    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global soft-delete query filter for all entities implementing ISoftDeletable
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                var falseConstant = Expression.Constant(false);
                var filter = Expression.Lambda(Expression.Equal(property, falseConstant), parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }

        // User indexes and constraints
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            entity.Property(u => u.ConcurrencyStamp).IsConcurrencyToken().HasMaxLength(64);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Slug).IsRequired().HasMaxLength(120);
        });

        // Course relationships & indexes
        modelBuilder.Entity<Course>(entity =>
        {
            entity.Property(c => c.Title).IsRequired().HasMaxLength(250);
            entity.Property(c => c.Price).HasPrecision(18, 2);
            entity.Property(c => c.ConcurrencyStamp).IsConcurrencyToken().HasMaxLength(64);

            entity.HasIndex(c => new { c.IsPublished, c.ApprovalStatus, c.CreatedAt });

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

        // LessonProgress relationships & composite indexes
        modelBuilder.Entity<LessonProgress>(entity =>
        {
            entity.HasIndex(lp => new { lp.UserId, lp.LessonId }).IsUnique();
            entity.HasIndex(lp => new { lp.UserId, lp.IsCompleted });

            entity.HasOne(lp => lp.User)
                  .WithMany(u => u.LessonProgresses)
                  .HasForeignKey(lp => lp.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(lp => lp.Lesson)
                  .WithMany(l => l.Progresses)
                  .HasForeignKey(lp => lp.LessonId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Review relationships & unique constraints
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => new { r.UserId, r.CourseId }).IsUnique();

            entity.HasOne(r => r.User)
                  .WithMany(u => u.Reviews)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Course)
                  .WithMany(c => c.Reviews)
                  .HasForeignKey(r => r.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Order relationships, precision, concurrency & indexes
        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.Amount).HasPrecision(18, 2);
            entity.Property(o => o.ConcurrencyStamp).IsConcurrencyToken().HasMaxLength(64);
            entity.Property(o => o.TransactionId).HasMaxLength(128);

            entity.HasIndex(o => o.TransactionId).IsUnique();

            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.Course)
                  .WithMany(c => c.Orders)
                  .HasForeignKey(o => o.CourseId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Quiz relationships (Lesson & Section)
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasOne(q => q.Lesson)
                  .WithOne(l => l.Quiz)
                  .HasForeignKey<Quiz>(q => q.LessonId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(q => q.Section)
                  .WithOne(s => s.Quiz)
                  .HasForeignKey<Quiz>(q => q.SectionId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasOne(qq => qq.Quiz)
                  .WithMany(q => q.Questions)
                  .HasForeignKey(qq => qq.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizOption>(entity =>
        {
            entity.HasOne(qo => qo.QuizQuestion)
                  .WithMany(qq => qq.Options)
                  .HasForeignKey(qo => qo.QuizQuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Certificate entity configuration
        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.Property(c => c.CertificateNumber).IsRequired().HasMaxLength(64);
            entity.Property(c => c.VerificationHash).IsRequired().HasMaxLength(128);

            entity.HasIndex(c => c.CertificateNumber).IsUnique();
            entity.HasIndex(c => c.VerificationHash).IsUnique();

            entity.HasOne(c => c.User)
                  .WithMany(u => u.Certificates)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Course)
                  .WithMany(co => co.Certificates)
                  .HasForeignKey(c => c.CourseId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // PromoCode entity configuration
        modelBuilder.Entity<PromoCode>(entity =>
        {
            entity.Property(p => p.Code).IsRequired().HasMaxLength(50);
            entity.Property(p => p.DiscountPercentage).HasPrecision(5, 2);
            entity.Property(p => p.MaxDiscountAmount).HasPrecision(18, 2);

            entity.HasIndex(p => p.Code).IsUnique();
        });

        // QuizAttempt entity configuration
        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasIndex(qa => new { qa.UserId, qa.QuizId, qa.AttemptedAt });

            entity.HasOne(qa => qa.Quiz)
                  .WithMany(q => q.Attempts)
                  .HasForeignKey(qa => qa.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(qa => qa.User)
                  .WithMany(u => u.QuizAttempts)
                  .HasForeignKey(qa => qa.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

    /// <summary>
    /// Overrides SaveChangesAsync to automate creation/update timestamps, concurrency tokens, and soft deletion.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAt == default)
                    entry.Entity.CreatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.ConcurrencyStamp = Guid.NewGuid().ToString("N");
            }
        }

        foreach (var entry in ChangeTracker.Entries<ISoftDeletable>())
        {
            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
