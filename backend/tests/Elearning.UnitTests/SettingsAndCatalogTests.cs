using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Elearning.UnitTests;

public class SettingsAndCatalogTests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ElearningDbContext(options);
    }

    [Fact]
    public async Task SettingsService_GetSettings_ReturnsDefaultsWhenEmpty()
    {
        using var db = CreateInMemoryDbContext();
        var service = new SettingsService(db);

        var settings = await service.GetSettingsAsync();

        Assert.NotNull(settings);
        Assert.Equal("TOTC", settings.SiteName);
        Assert.Equal(string.Empty, settings.LogoUrl);
        Assert.False(string.IsNullOrWhiteSpace(settings.ContactEmail));
    }

    [Fact]
    public async Task SettingsService_UpdateSettings_PersistsNewValues()
    {
        using var db = CreateInMemoryDbContext();
        var service = new SettingsService(db);

        var updated = await service.UpdateSettingsAsync(new UpdateSiteSettingsDto
        {
            LogoUrl = "https://example.com/logo.png",
            SiteName = "My Custom LMS",
            HeroTitle = "ახალი სათაური"
        });

        Assert.Equal("https://example.com/logo.png", updated.LogoUrl);
        Assert.Equal("My Custom LMS", updated.SiteName);
        Assert.Equal("ახალი სათაური", updated.HeroTitle);

        var retrieved = await service.GetSettingsAsync();
        Assert.Equal("https://example.com/logo.png", retrieved.LogoUrl);
        Assert.Equal("My Custom LMS", retrieved.SiteName);
    }

    [Fact]
    public async Task CourseService_CategoryCRUD_WorksCorrectly()
    {
        using var db = CreateInMemoryDbContext();
        var service = new CourseService(db);

        // 1. Create Category
        var created = await service.CreateCategoryAsync(new CreateCategoryDto
        {
            Name = "Data Science",
            IconUrl = "https://example.com/icon.svg"
        });

        Assert.NotNull(created);
        Assert.Equal("Data Science", created.Name);
        Assert.Equal("data-science", created.Slug);
        Assert.Equal("https://example.com/icon.svg", created.IconUrl);

        // 2. Update Category
        var updated = await service.UpdateCategoryAsync(created.Id, new UpdateCategoryDto
        {
            Name = "Data Science & AI",
            Slug = "ai-data"
        });

        Assert.Equal("Data Science & AI", updated.Name);
        Assert.Equal("ai-data", updated.Slug);

        // 3. Delete Category
        var deleted = await service.DeleteCategoryAsync(created.Id);
        Assert.True(deleted);

        var remaining = await service.GetCategoriesAsync();
        Assert.DoesNotContain(remaining, c => c.Id == created.Id);
    }

    [Fact]
    public async Task CourseService_DeleteCategory_ThrowsWhenCoursesAssigned()
    {
        using var db = CreateInMemoryDbContext();
        var service = new CourseService(db);

        var category = new Category { Name = "Web", Slug = "web" };
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var instructor = new User { FullName = "Prof", Email = "prof@test.com", PasswordHash = "hash" };
        db.Users.Add(instructor);
        await db.SaveChangesAsync();

        var course = new Course
        {
            Title = "ASP.NET Core",
            CategoryId = category.Id,
            InstructorId = instructor.Id,
            Price = 100
        };
        db.Courses.Add(course);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteCategoryAsync(category.Id));
    }

    [Fact]
    public async Task CourseService_TogglePopularAndSort_PrioritizesPopularCourses()
    {
        using var db = CreateInMemoryDbContext();
        var service = new CourseService(db);

        var category = new Category { Name = "Dev", Slug = "dev" };
        db.Categories.Add(category);

        var instructor = new User { FullName = "Instructor", Email = "inst@test.com", PasswordHash = "hash" };
        db.Users.Add(instructor);
        await db.SaveChangesAsync();

        var courseA = new Course
        {
            Title = "Standard Course A",
            CategoryId = category.Id,
            InstructorId = instructor.Id,
            IsPublished = true,
            ApprovalStatus = "Approved",
            IsPopular = false,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var courseB = new Course
        {
            Title = "Popular Course B",
            CategoryId = category.Id,
            InstructorId = instructor.Id,
            IsPublished = true,
            ApprovalStatus = "Approved",
            IsPopular = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };

        db.Courses.AddRange(courseA, courseB);
        await db.SaveChangesAsync();

        // Toggle course B to popular
        var isPopular = await service.ToggleCoursePopularAsync(courseB.Id);
        Assert.True(isPopular);

        // Catalog query with default popular sorting
        var catalog = await service.GetCoursesAsync(new CourseFilterParams());

        Assert.Equal(2, catalog.Items.Count);
        Assert.Equal(courseB.Id, catalog.Items[0].Id); // Course B must be FIRST because IsPopular == true!
        Assert.True(catalog.Items[0].IsPopular);
        Assert.False(catalog.Items[1].IsPopular);
    }
}
