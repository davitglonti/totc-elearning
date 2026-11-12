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
        await SeedPromoCodesAsync(context);

        if (await context.Categories.AnyAsync())
        {
            return; // Data already seeded
        }

        // 1. Seed Categories with deterministic IDs
        var devCategory = new Category { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Name = "Development", Slug = "development", IconUrl = "code" };
        var designCategory = new Category { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Name = "Design", Slug = "design", IconUrl = "layout" };
        var photoCategory = new Category { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Name = "Photography", Slug = "photography", IconUrl = "camera" };
        var businessCategory = new Category { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Name = "Business", Slug = "business", IconUrl = "briefcase" };
        var marketingCategory = new Category { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Name = "Marketing", Slug = "marketing", IconUrl = "trending-up" };

        context.Categories.AddRange(devCategory, designCategory, photoCategory, businessCategory, marketingCategory);

        // 2. Seed Users & Instructors with deterministic IDs
        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        var adminUser = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
            FullName = "TOTC Administrator",
            Email = "admin@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
            Bio = "Chief Education Officer and Administrator at TOTC."
        };

        var instructorLina = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
            FullName = "Lina Wilson",
            Email = "lina@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            Headline = "Principal Cloud Architect & Senior EdTech Consultant",
            Bio = "Lina is a seasoned Cloud Solutions Architect with 12+ years of experience engineering high-scale distributed systems and interactive online learning infrastructure. She is an author, keynote speaker, and has mentored over 45,000 students globally.",
            Education = "M.S. in Computer Science - Stanford University (2014) • B.S. in Software Engineering - MIT (2012) • AWS Certified Solutions Architect Professional",
            Experience = "Principal Cloud Architect at CloudScale Global (2019-Present) • Senior Infrastructure Engineer at TechCorp (2015-2019) • EdTech Curriculum Fellow",
            Website = "https://totc.edu/instructors/lina-wilson"
        };

        var instructorMarcus = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000003"),
            FullName = "Marcus Chen",
            Email = "marcus@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            Headline = "Lead Product Designer & Design Systems Strategist",
            Bio = "Marcus Chen focuses on modern human-computer interaction, interactive prototypes, and scalable design systems. He leads UX initiatives for global platforms and teaches design thinking.",
            Education = "M.Des in Human-Computer Interaction - Carnegie Mellon University • Certified Usability Analyst (HFI)",
            Experience = "Staff Product Designer at CanvasHQ (2018-Present) • Senior UI/UX Specialist at StudioDesign (2014-2018)",
            Website = "https://totc.edu/instructors/marcus-chen"
        };

        var instructorSophia = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000004"),
            FullName = "Sophia Perez",
            Email = "sophia@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Instructor,
            AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
            Headline = "Commercial Lighting Director & Master Visual Storyteller",
            Bio = "Sophia Perez is an internationally acclaimed photographer and digital artist with works featured in top publications. She specializes in cinematic lighting, digital post-production, and visual storytelling.",
            Education = "B.F.A. in Visual Arts & Digital Media - Rhode Island School of Design (RISD) • Master Class Certification in Cinematography",
            Experience = "Creative Director at Luminance Studio (2017-Present) • Editorial Lighting Specialist for Global Publications (2013-2017)",
            Website = "https://totc.edu/instructors/sophia-perez"
        };

        var studentUser = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000005"),
            FullName = "Gloria Rose",
            Email = "student@totc.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Student,
            AvatarUrl = "/assets/testimonial_avatar.png",
            Bio = "Passionate online student mastering full-stack cloud and interactive design."
        };

        var proUser = new User
        {
            Id = Guid.Parse("20000000-0000-0000-0000-000000000006"),
            FullName = "Davit Glonti",
            Email = "davit@test.com",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Student,
            IsSubscribed = true,
            SubscriptionPlan = "Pro",
            SubscriptionExpiresAt = DateTime.UtcNow.AddYears(1),
            AvatarUrl = "/assets/testimonial_avatar.png",
            Bio = "Pro Member with unlimited access to all courses."
        };

        context.Users.AddRange(adminUser, instructorLina, instructorMarcus, instructorSophia, studentUser, proUser);

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
        
        var lessonAws1 = new Lesson
        {
            Title = "Welcome to AWS Cloud Fundamentals",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            DurationMinutes = 15,
            ContentText = "Welcome to the cloud solutions architect curriculum. In this lesson we establish the core paradigms.",
            IsFreePreview = true,
            OrderIndex = 1,
            LessonType = "Video"
        };

        // Attach Knowledge Check Quiz to Lesson 1
        var quizLesson1 = new Quiz
        {
            Title = "Knowledge Check: Cloud Fundamentals",
            Description = "Test your understanding of core compute, networking, and high availability principles.",
            PassingScorePercentage = 70,
            Lesson = lessonAws1
        };

        var q1 = new QuizQuestion
        {
            QuestionText = "Which AWS core service provides resizable, secure compute capacity in the cloud?",
            Explanation = "Amazon EC2 (Elastic Compute Cloud) provides virtual server capacity on demand.",
            OrderIndex = 1,
            Quiz = quizLesson1
        };
        q1.Options.Add(new QuizOption { OptionText = "Amazon S3", IsCorrect = false });
        q1.Options.Add(new QuizOption { OptionText = "Amazon EC2 (Elastic Compute Cloud)", IsCorrect = true });
        q1.Options.Add(new QuizOption { OptionText = "AWS IAM", IsCorrect = false });
        q1.Options.Add(new QuizOption { OptionText = "Amazon SNS", IsCorrect = false });

        var q2 = new QuizQuestion
        {
            QuestionText = "Which component enables communication between instances in your VPC and the public internet?",
            Explanation = "An Internet Gateway (IGW) is horizontally scaled and redundant, connecting VPC route tables to the internet.",
            OrderIndex = 2,
            Quiz = quizLesson1
        };
        q2.Options.Add(new QuizOption { OptionText = "Internet Gateway (IGW)", IsCorrect = true });
        q2.Options.Add(new QuizOption { OptionText = "Security Group Ingress Rule", IsCorrect = false });
        q2.Options.Add(new QuizOption { OptionText = "AWS Direct Connect Terminal", IsCorrect = false });
        q2.Options.Add(new QuizOption { OptionText = "EBS Snapshot", IsCorrect = false });

        var q3 = new QuizQuestion
        {
            QuestionText = "What is the primary architectural purpose of a Multi-AZ deployment in AWS?",
            Explanation = "Multi-AZ architectures place synchronous replicas in separate physical data centers for seamless fault tolerance.",
            OrderIndex = 3,
            Quiz = quizLesson1
        };
        q3.Options.Add(new QuizOption { OptionText = "Reducing cloud billing costs by 50%", IsCorrect = false });
        q3.Options.Add(new QuizOption { OptionText = "High availability and automatic failover protection", IsCorrect = true });
        q3.Options.Add(new QuizOption { OptionText = "Compressing static assets on disk", IsCorrect = false });
        q3.Options.Add(new QuizOption { OptionText = "Eliminating the need for IAM users", IsCorrect = false });

        quizLesson1.Questions.Add(q1);
        quizLesson1.Questions.Add(q2);
        quizLesson1.Questions.Add(q3);
        lessonAws1.Quiz = quizLesson1;

        awsSection1.Lessons.Add(lessonAws1);

        var lessonAws2 = new Lesson
        {
            Title = "Designing Scalable VPCs and Subnets",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            DurationMinutes = 25,
            ContentText = "Understanding CIDR blocks, route tables, and internet gateways.",
            IsFreePreview = false,
            OrderIndex = 2,
            LessonType = "Video"
        };
        awsSection1.Lessons.Add(lessonAws2);

        var lessonAwsLab = new Lesson
        {
            Title = "Hands-on Lab: Configure Multi-AZ Subnets & Route Tables",
            DurationMinutes = 40,
            ContentText = "Practical deployment task: Build an isolated 2-tier VPC architecture with public and private subnets.",
            IsFreePreview = false,
            OrderIndex = 3,
            LessonType = "Assignment"
        };
        awsSection1.Lessons.Add(lessonAwsLab);

        var lessonAwsExam1 = new Lesson
        {
            Title = "Module 1 Final Examination: Cloud Infrastructure Mastery",
            DurationMinutes = 20,
            ContentText = "Official proctored examination for Module 1. Passing grade: 70%. Achieving the passing score is strictly required to unlock Module 2.",
            IsFreePreview = false,
            OrderIndex = 4,
            LessonType = "Quiz"
        };

        var quizModule1Exam = new Quiz
        {
            Title = "Module 1 Final Examination: Cloud Infrastructure Mastery",
            Description = "Comprehensive proctored assessment. Anti-cheating monitoring is active. Minimum 70% required to unlock Module 2.",
            PassingScorePercentage = 70,
            Lesson = lessonAwsExam1
        };

        var qm1_1 = new QuizQuestion
        {
            QuestionText = "When architecting a fault-tolerant multi-tier web application, where should your relational database replicas reside?",
            Explanation = "Deploying read/standby replicas in distinct Availability Zones ensures seamless failover and redundancy.",
            OrderIndex = 1,
            Quiz = quizModule1Exam
        };
        qm1_1.Options.Add(new QuizOption { OptionText = "In a single public subnet for faster routing", IsCorrect = false });
        qm1_1.Options.Add(new QuizOption { OptionText = "Across multiple Availability Zones in private subnets", IsCorrect = true });
        qm1_1.Options.Add(new QuizOption { OptionText = "On edge locations outside VPC route tables", IsCorrect = false });
        qm1_1.Options.Add(new QuizOption { OptionText = "Inside an unencrypted S3 storage bucket", IsCorrect = false });

        var qm1_2 = new QuizQuestion
        {
            QuestionText = "Which security layer acts as a stateful virtual firewall controlling traffic at the EC2 instance level?",
            Explanation = "Security Groups are stateful firewalls operating at the instance interface level, whereas Network ACLs are stateless at subnet boundaries.",
            OrderIndex = 2,
            Quiz = quizModule1Exam
        };
        qm1_2.Options.Add(new QuizOption { OptionText = "Security Group", IsCorrect = true });
        qm1_2.Options.Add(new QuizOption { OptionText = "Network Access Control List (NACL)", IsCorrect = false });
        qm1_2.Options.Add(new QuizOption { OptionText = "AWS Shield Standard", IsCorrect = false });
        qm1_2.Options.Add(new QuizOption { OptionText = "Internet Gateway Route Policy", IsCorrect = false });

        var qm1_3 = new QuizQuestion
        {
            QuestionText = "What mechanism allows an Auto Scaling Group to dynamically scale compute instances based on changing CPU utilization thresholds?",
            Explanation = "Target tracking and dynamic scaling policies trigger alarms in CloudWatch to add or remove EC2 instances automatically.",
            OrderIndex = 3,
            Quiz = quizModule1Exam
        };
        qm1_3.Options.Add(new QuizOption { OptionText = "CloudWatch Alarms with Dynamic Target Tracking Scaling Policies", IsCorrect = true });
        qm1_3.Options.Add(new QuizOption { OptionText = "Manual SSH cron scripts on the bastion host", IsCorrect = false });
        qm1_3.Options.Add(new QuizOption { OptionText = "DNS round-robin TTL adjustments in Route 53", IsCorrect = false });
        qm1_3.Options.Add(new QuizOption { OptionText = "Direct Connect failover routers", IsCorrect = false });

        quizModule1Exam.Questions.Add(qm1_1);
        quizModule1Exam.Questions.Add(qm1_2);
        quizModule1Exam.Questions.Add(qm1_3);
        lessonAwsExam1.Quiz = quizModule1Exam;
        awsSection1.Lessons.Add(lessonAwsExam1);

        var awsSection2 = new Section { Course = courseAws, Title = "Module 2: Real-time Gradebook & Webhook Pipelines", OrderIndex = 2 };
        awsSection2.Lessons.Add(new Lesson
        {
            Title = "Deploying DynamoDB for Live Student Rosters",
            VideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            DurationMinutes = 30,
            ContentText = "High-throughput real-time database architecture for millions of connected students.",
            IsFreePreview = false,
            OrderIndex = 1,
            LessonType = "Video"
        });

        var awsSectionQuiz = new Lesson
        {
            Title = "Module Quiz: Distributed Systems & Gradebook Architecture",
            DurationMinutes = 20,
            ContentText = "Comprehensive module evaluation covering NoSQL scaling, webhooks, and attendance tracking.",
            IsFreePreview = false,
            OrderIndex = 2,
            LessonType = "Quiz"
        };

        var quizModule2Exam = new Quiz
        {
            Title = "Module Quiz: Distributed Systems & Gradebook Architecture",
            Description = "Comprehensive final assessment for Module 2. Test your knowledge on DynamoDB, global tables, webhooks, and real-time streaming.",
            PassingScorePercentage = 70,
            Lesson = awsSectionQuiz
        };

        var qm2_1 = new QuizQuestion
        {
            QuestionText = "Which DynamoDB feature enables asynchronous real-time change data capture for webhook distribution?",
            Explanation = "DynamoDB Streams captures time-ordered sequences of item-level modifications in any DynamoDB table.",
            OrderIndex = 1,
            Quiz = quizModule2Exam
        };
        qm2_1.Options.Add(new QuizOption { OptionText = "DynamoDB Streams", IsCorrect = true });
        qm2_1.Options.Add(new QuizOption { OptionText = "DynamoDB Accelerator (DAX)", IsCorrect = false });
        qm2_1.Options.Add(new QuizOption { OptionText = "Global Secondary Index (GSI)", IsCorrect = false });
        qm2_1.Options.Add(new QuizOption { OptionText = "S3 Cross-Region Replication", IsCorrect = false });

        quizModule2Exam.Questions.Add(qm2_1);
        awsSectionQuiz.Quiz = quizModule2Exam;
        awsSection2.Lessons.Add(awsSectionQuiz);

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

    /// <summary>
    /// Enriches existing instructor accounts with education, experience, and headlines if not present.
    /// </summary>
    public static async Task EnrichInstructorProfilesAsync(ElearningDbContext context)
    {
        var lina = await context.Users.FirstOrDefaultAsync(u => u.Email == "lina@totc.com");
        if (lina != null && string.IsNullOrWhiteSpace(lina.Headline))
        {
            lina.Headline = "Principal Cloud Architect & Senior EdTech Consultant";
            lina.Bio = "Lina is a seasoned Cloud Solutions Architect with 12+ years of experience engineering high-scale distributed systems and interactive online learning infrastructure. She is an author, keynote speaker, and has mentored over 45,000 students globally.";
            lina.Education = "M.S. in Computer Science - Stanford University (2014) • B.S. in Software Engineering - MIT (2012) • AWS Certified Solutions Architect Professional";
            lina.Experience = "Principal Cloud Architect at CloudScale Global (2019-Present) • Senior Infrastructure Engineer at TechCorp (2015-2019) • EdTech Curriculum Fellow";
            lina.Website = "https://totc.edu/instructors/lina-wilson";
        }

        var sophia = await context.Users.FirstOrDefaultAsync(u => u.Email == "sophia@totc.com");
        if (sophia != null && string.IsNullOrWhiteSpace(sophia.Headline))
        {
            sophia.Headline = "Commercial Lighting Director & Master Visual Storyteller";
            sophia.Bio = "Sophia Perez is an internationally acclaimed photographer and digital artist with works featured in top publications. She specializes in cinematic lighting, digital post-production, and visual storytelling.";
            sophia.Education = "B.F.A. in Visual Arts & Digital Media - Rhode Island School of Design (RISD) • Master Class Certification in Cinematography";
            sophia.Experience = "Creative Director at Luminance Studio (2017-Present) • Editorial Lighting Specialist for Global Publications (2013-2017)";
            sophia.Website = "https://totc.edu/instructors/sophia-perez";
        }

        var marcus = await context.Users.FirstOrDefaultAsync(u => u.Email == "marcus@totc.com");
        if (marcus != null && string.IsNullOrWhiteSpace(marcus.Headline))
        {
            marcus.Headline = "Lead Product Designer & Design Systems Strategist";
            marcus.Bio = "Marcus Chen focuses on modern human-computer interaction, interactive prototypes, and scalable design systems. He leads UX initiatives for global platforms and teaches design thinking.";
            marcus.Education = "M.Des in Human-Computer Interaction - Carnegie Mellon University • Certified Usability Analyst (HFI)";
            marcus.Experience = "Staff Product Designer at CanvasHQ (2018-Present) • Senior UI/UX Specialist at StudioDesign (2014-2018)";
            marcus.Website = "https://totc.edu/instructors/marcus-chen";
        }

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Ensures all modules have an end-of-module Final Examination / Quiz with questions attached.
    /// </summary>
    public static async Task EnrichModuleQuizzesAsync(ElearningDbContext context)
    {
        var courseAws = await context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
                    .ThenInclude(l => l.Quiz)
                        .ThenInclude(q => q.Questions)
                            .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(c => c.Title.Contains("AWS Certified"));

        if (courseAws != null)
        {
            var sec1 = courseAws.Sections.OrderBy(s => s.OrderIndex).FirstOrDefault();
            if (sec1 != null)
            {
                var hasExam = sec1.Lessons.Any(l => l.LessonType == "Quiz" || l.Title.Contains("Final Exam") || l.Title.Contains("Examination"));
                if (!hasExam)
                {
                    var examLesson = new Lesson
                    {
                        SectionId = sec1.Id,
                        Title = "Module 1 Final Examination: Cloud Infrastructure Mastery",
                        DurationMinutes = 20,
                        ContentText = "Official proctored examination for Module 1. Passing grade: 70%. Achieving the passing score is strictly required to unlock Module 2.",
                        IsFreePreview = false,
                        OrderIndex = sec1.Lessons.Count + 1,
                        LessonType = "Quiz"
                    };

                    var quiz = new Quiz
                    {
                        Title = "Module 1 Final Examination: Cloud Infrastructure Mastery",
                        Description = "Comprehensive proctored assessment. Anti-cheating monitoring is active. Minimum 70% required to unlock Module 2.",
                        PassingScorePercentage = 70,
                        Lesson = examLesson
                    };

                    var q1 = new QuizQuestion
                    {
                        QuestionText = "When architecting a fault-tolerant multi-tier web application, where should your relational database replicas reside?",
                        Explanation = "Deploying read/standby replicas in distinct Availability Zones ensures seamless failover and redundancy.",
                        OrderIndex = 1,
                        Quiz = quiz
                    };
                    q1.Options.Add(new QuizOption { OptionText = "In a single public subnet for faster routing", IsCorrect = false });
                    q1.Options.Add(new QuizOption { OptionText = "Across multiple Availability Zones in private subnets", IsCorrect = true });
                    q1.Options.Add(new QuizOption { OptionText = "On edge locations outside VPC route tables", IsCorrect = false });
                    q1.Options.Add(new QuizOption { OptionText = "Inside an unencrypted S3 storage bucket", IsCorrect = false });

                    var q2 = new QuizQuestion
                    {
                        QuestionText = "Which security layer acts as a stateful virtual firewall controlling traffic at the EC2 instance level?",
                        Explanation = "Security Groups are stateful firewalls operating at the instance interface level, whereas Network ACLs are stateless at subnet boundaries.",
                        OrderIndex = 2,
                        Quiz = quiz
                    };
                    q2.Options.Add(new QuizOption { OptionText = "Security Group", IsCorrect = true });
                    q2.Options.Add(new QuizOption { OptionText = "Network Access Control List (NACL)", IsCorrect = false });
                    q2.Options.Add(new QuizOption { OptionText = "AWS Shield Standard", IsCorrect = false });
                    q2.Options.Add(new QuizOption { OptionText = "Internet Gateway Route Policy", IsCorrect = false });

                    var q3 = new QuizQuestion
                    {
                        QuestionText = "What mechanism allows an Auto Scaling Group to dynamically scale compute instances based on changing CPU utilization thresholds?",
                        Explanation = "Target tracking and dynamic scaling policies trigger alarms in CloudWatch to add or remove EC2 instances automatically.",
                        OrderIndex = 3,
                        Quiz = quiz
                    };
                    q3.Options.Add(new QuizOption { OptionText = "CloudWatch Alarms with Dynamic Target Tracking Scaling Policies", IsCorrect = true });
                    q3.Options.Add(new QuizOption { OptionText = "Manual SSH cron scripts on the bastion host", IsCorrect = false });
                    q3.Options.Add(new QuizOption { OptionText = "DNS round-robin TTL adjustments in Route 53", IsCorrect = false });
                    q3.Options.Add(new QuizOption { OptionText = "Direct Connect failover routers", IsCorrect = false });

                    quiz.Questions.Add(q1);
                    quiz.Questions.Add(q2);
                    quiz.Questions.Add(q3);
                    examLesson.Quiz = quiz;

                    context.Lessons.Add(examLesson);
                    await context.SaveChangesAsync();
                }
            }

            var sec2 = courseAws.Sections.OrderBy(s => s.OrderIndex).Skip(1).FirstOrDefault();
            if (sec2 != null)
            {
                var quizLesson = sec2.Lessons.FirstOrDefault(l => l.LessonType == "Quiz");
                if (quizLesson != null && (quizLesson.Quiz == null || !quizLesson.Quiz.Questions.Any()))
                {
                    var quiz = quizLesson.Quiz ?? new Quiz
                    {
                        Title = "Module Quiz: Distributed Systems & Gradebook Architecture",
                        Description = "Comprehensive final assessment for Module 2. Test your knowledge on DynamoDB, global tables, webhooks, and real-time streaming.",
                        PassingScorePercentage = 70,
                        Lesson = quizLesson
                    };

                    var q1 = new QuizQuestion
                    {
                        QuestionText = "Which DynamoDB feature enables asynchronous real-time change data capture for webhook distribution?",
                        Explanation = "DynamoDB Streams captures time-ordered sequences of item-level modifications in any DynamoDB table.",
                        OrderIndex = 1,
                        Quiz = quiz
                    };
                    q1.Options.Add(new QuizOption { OptionText = "DynamoDB Streams", IsCorrect = true });
                    q1.Options.Add(new QuizOption { OptionText = "DynamoDB Accelerator (DAX)", IsCorrect = false });
                    q1.Options.Add(new QuizOption { OptionText = "Global Secondary Index (GSI)", IsCorrect = false });
                    q1.Options.Add(new QuizOption { OptionText = "S3 Cross-Region Replication", IsCorrect = false });

                    quiz.Questions.Add(q1);
                    if (quizLesson.Quiz == null)
                    {
                        quizLesson.Quiz = quiz;
                        context.Quizzes.Add(quiz);
                    }
                    await context.SaveChangesAsync();
                }
            }
        }
    }

    public static async Task SeedPromoCodesAsync(ElearningDbContext context)
    {
        if (await context.PromoCodes.AnyAsync())
        {
            return;
        }

        var promoCodes = new List<PromoCode>
        {
            new PromoCode
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000001"),
                Code = "TOTC",
                DiscountPercentage = 20m,
                MaxDiscountAmount = 100m,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddYears(2),
                MaxUsageCount = 10000,
                CurrentUsageCount = 0,
                IsActive = true
            },
            new PromoCode
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000002"),
                Code = "TOTC2026",
                DiscountPercentage = 25m,
                MaxDiscountAmount = 150m,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddYears(2),
                MaxUsageCount = 5000,
                CurrentUsageCount = 0,
                IsActive = true
            },
            new PromoCode
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000003"),
                Code = "WELCOME50",
                DiscountPercentage = 50m,
                MaxDiscountAmount = 50m,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddYears(1),
                MaxUsageCount = 2000,
                CurrentUsageCount = 0,
                IsActive = true
            },
            new PromoCode
            {
                Id = Guid.Parse("70000000-0000-0000-0000-000000000004"),
                Code = "STUDENT10",
                DiscountPercentage = 10m,
                MaxDiscountAmount = null,
                ValidFrom = DateTime.UtcNow.AddDays(-30),
                ValidUntil = DateTime.UtcNow.AddYears(2),
                MaxUsageCount = 20000,
                CurrentUsageCount = 0,
                IsActive = true
            }
        };

        context.PromoCodes.AddRange(promoCodes);
        await context.SaveChangesAsync();
    }
}
