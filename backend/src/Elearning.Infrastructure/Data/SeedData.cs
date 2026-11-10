using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Data;

/// <summary>
/// Seeds initial realistic data matching the TOTC frontend platform.
/// </summary>
public static class SeedData
{
    public static async Task InitializeAsync(ElearningDbContext context)
    {
        if (await context.Categories.AnyAsync())
        {
            return; // Data already seeded
        }

        // 1. Seed Categories
        var devCategory = new Category { Name = "Development", Slug = "development", IconUrl = "code" };
        var designCategory = new Category { Name = "Design", Slug = "design", IconUrl = "layout" };
        var photoCategory = new Category { Name = "Photography", Slug = "photography", IconUrl = "camera" };
        var businessCategory = new Category { Name = "Business", Slug = "business", IconUrl = "briefcase" };
        var marketingCategory = new Category { Name = "Marketing", Slug = "marketing", IconUrl = "trending-up" };

        context.Categories.AddRange(devCategory, designCategory, photoCategory, businessCategory, marketingCategory);

        // 2. Seed Users & Instructors
        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        var adminUser = new User
        {
            FullName = "TOTC Administrator",
            Email = "admin@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
            Bio = "Chief Education Officer and Administrator at TOTC."
        };

        var instructorLina = new User
        {
            FullName = "Lina Wilson",
            Email = "lina@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            Bio = "Principal Cloud Architect and Senior EdTech Consultant with 12+ years experience."
        };

        var instructorMarcus = new User
        {
            FullName = "Marcus Chen",
            Email = "marcus@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            Bio = "Lead Product Designer & UX Strategist specialized in interactive learning environments."
        };

        var instructorSophia = new User
        {
            FullName = "Sophia Perez",
            Email = "sophia@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
            Bio = "Award-winning commercial photographer and visual educator."
        };

        var studentUser = new User
        {
            FullName = "Gloria Rose",
            Email = "student@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Student,
            AvatarUrl = "/assets/testimonial_avatar.png",
            Bio = "Passionate online student mastering full-stack cloud and interactive design."
        };

        context.Users.AddRange(adminUser, instructorLina, instructorMarcus, instructorSophia, studentUser);

        // 3. Seed Course 1: AWS Certified Solutions Architect
        var courseAws = new Course
        {
            Title = "AWS Certified Solutions Architect & Cloud Operations",
            Description = "Master state-of-the-art cloud architecture, distributed systems, resilient virtual classroom pipelines, and certification preparation.",
            ThumbnailUrl = "/assets/explore_row_1.png",
            Price = 450m,
            Level = CourseLevel.Advanced,
            CategoryId = devCategory.Id,
            InstructorId = instructorLina.Id,
            IsPublished = true
        };

        // Course 1 Sections & Lessons
        var awsSection1 = new Section { Course = courseAws, Title = "Module 1: Introduction to Cloud Infrastructure", OrderIndex = 1 };
        awsSection1.Lessons.Add(new Lesson
        {
            Title = "Welcome to AWS Cloud Fundamentals",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            DurationMinutes = 15,
            ContentText = "Welcome to the cloud solutions architect curriculum. In this lesson we establish the core paradigms.",
            IsFreePreview = true,
            OrderIndex = 1
        });
        awsSection1.Lessons.Add(new Lesson
        {
            Title = "Designing Scalable VPCs and Subnets",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            DurationMinutes = 25,
            ContentText = "Understanding CIDR blocks, route tables, and internet gateways.",
            IsFreePreview = false,
            OrderIndex = 2
        });

        var awsSection2 = new Section { Course = courseAws, Title = "Module 2: Real-time Gradebook & Webhook Pipelines", OrderIndex = 2 };
        awsSection2.Lessons.Add(new Lesson
        {
            Title = "Deploying DynamoDB for Live Student Rosters",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            DurationMinutes = 30,
            ContentText = "High-throughput real-time database architecture for millions of connected students.",
            IsFreePreview = false,
            OrderIndex = 1
        });

        courseAws.Sections.Add(awsSection1);
        courseAws.Sections.Add(awsSection2);

        // 4. Seed Course 2: Full-Stack Web Design & UI/UX
        var courseUiUx = new Course
        {
            Title = "Full-Stack Modern Web Design & Interactive UI/UX Systems",
            Description = "Learn how to build responsive, accessible, pixel-perfect web experiences with Figma, Tailwind CSS, and React.",
            ThumbnailUrl = "/assets/explore_row_2.png",
            Price = 380m,
            Level = CourseLevel.Intermediate,
            CategoryId = designCategory.Id,
            InstructorId = instructorMarcus.Id,
            IsPublished = true
        };

        var uiSection1 = new Section { Course = courseUiUx, Title = "Module 1: Foundations of Classroom Interface Design", OrderIndex = 1 };
        uiSection1.Lessons.Add(new Lesson
        {
            Title = "Design Tokens, Colors & Poppins Typography",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            DurationMinutes = 20,
            ContentText = "Deep dive into establishing clean typography hierarchies and color tokens.",
            IsFreePreview = true,
            OrderIndex = 1
        });

        courseUiUx.Sections.Add(uiSection1);

        // 5. Seed Course 3: Photography & Storytelling
        var coursePhoto = new Course
        {
            Title = "Mastering Digital Photography, Lighting & Visual Storytelling",
            Description = "Comprehensive professional lighting techniques, framing, studio gear, and digital post-production.",
            ThumbnailUrl = "/assets/explore_row_3.png",
            Price = 290m,
            Level = CourseLevel.Beginner,
            CategoryId = photoCategory.Id,
            InstructorId = instructorSophia.Id,
            IsPublished = true
        };

        var photoSection1 = new Section { Course = coursePhoto, Title = "Module 1: Camera Controls & Natural Lighting", OrderIndex = 1 };
        photoSection1.Lessons.Add(new Lesson
        {
            Title = "The Exposure Triangle: Aperture, Shutter & ISO",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            DurationMinutes = 22,
            ContentText = "Mastering the mechanical fundamentals of modern sensors and lenses.",
            IsFreePreview = true,
            OrderIndex = 1
        });

        coursePhoto.Sections.Add(photoSection1);

        context.Courses.AddRange(courseAws, courseUiUx, coursePhoto);

        // 6. Seed Student Enrollment for Gloria Rose in AWS Course
        var studentEnrollment = new Enrollment
        {
            User = studentUser,
            Course = courseAws,
            EnrolledAt = DateTime.UtcNow.AddDays(-7),
            IsCompleted = false
        };
        context.Enrollments.Add(studentEnrollment);

        // 7. Seed Reviews
        context.Reviews.Add(new Review
        {
            User = studentUser,
            Course = courseAws,
            Rating = 5,
            Comment = "Thank you so much for your help. It's exactly what I've been looking for. You won't regret it. It really saves me time and effort. TOTC is exactly what our business has been lacking.",
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        });

        await context.SaveChangesAsync();
    }
}
