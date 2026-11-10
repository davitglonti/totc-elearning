# TOTC E-Learning (LMS) Backend - ASP.NET Core 9 Web API

Enterprise-grade Learning Management System (LMS) backend built with **ASP.NET Core 9 Web API**, **Entity Framework Core (EF Core)**, and **Clean Architecture**.

---

## 🏛️ Solution Architecture (Clean Architecture)

```
backend/
├── Elearning.sln
└── src/
    ├── Elearning.Domain/            # Enterprise Entities, Enums & Domain Rules
    │   ├── Entities/                # User, Course, Section, Lesson, Enrollment, LessonProgress, Review, Order, Category
    │   └── Enums/                   # UserRole, CourseLevel, PaymentStatus
    │
    ├── Elearning.Application/       # Application Logic, Interfaces & DTOs
    │   ├── DTOs/                    # AuthDtos, CourseDtos, CurriculumDtos, LearningDtos, ReviewDtos, PaymentDtos
    │   └── Interfaces/              # IAuthService, ICourseService, IEnrollmentService, IPaymentService, IMediaService, ITokenService
    │
    ├── Elearning.Infrastructure/    # Data Access, Persistence & External Services
    │   ├── Data/                    # ElearningDbContext, SeedData (Initial courses, instructors, lessons)
    │   └── Services/                # AuthService, CourseService, EnrollmentService, PaymentService, TokenService, LocalMediaService
    │
    └── Elearning.API/               # REST Presentation Layer, Controllers & Configurations
        ├── Controllers/             # AuthController, UsersController, CoursesController, InstructorCoursesController, etc.
        ├── Properties/              # launchSettings.json (http://localhost:5000)
        ├── appsettings.json         # Connection strings, JWT settings
        └── Program.cs               # DI container, JWT auth, Swagger UI, CORS policy
```

---

## 🗄️ Database Entities & Relationships

| Entity | Primary Attributes | Relationships |
|---|---|---|
| **User** | `Id`, `FullName`, `Email`, `PasswordHash`, `Role`, `AvatarUrl`, `Bio` | Author of Courses, Enrollments, Reviews, Orders |
| **Category** | `Id`, `Name`, `Slug`, `IconUrl` | 1-to-many with Courses |
| **Course** | `Id`, `Title`, `Description`, `ThumbnailUrl`, `Price`, `Level`, `IsPublished` | Belongs to Category & Instructor; has Sections, Reviews, Enrollments |
| **Section** | `Id`, `CourseId`, `Title`, `OrderIndex` | Belongs to Course; has Lessons (Module 1, Module 2) |
| **Lesson** | `Id`, `SectionId`, `Title`, `VideoUrl`, `DurationMinutes`, `ContentText`, `IsFreePreview` | Belongs to Section; tracks LessonProgress |
| **Enrollment** | `Id`, `UserId`, `CourseId`, `EnrolledAt`, `IsCompleted` | Junction between User and Course |
| **LessonProgress** | `Id`, `UserId`, `LessonId`, `IsCompleted`, `LastWatchedPositionSeconds` | Tracks video timestamp and completion |
| **Review** | `Id`, `UserId`, `CourseId`, `Rating` (1-5), `Comment`, `CreatedAt` | Verified student ratings |
| **Order** | `Id`, `UserId`, `CourseId`, `Amount`, `Currency`, `PaymentStatus`, `TransactionId` | Financial checkout logs & webhooks |

---

## 🔑 Pre-seeded Accounts for Testing

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Administrator** | `admin@totc.com` | `Password123!` | Full platform administration & management |
| **Instructor** | `lina@totc.com` | `Password123!` | Create & edit courses, sections, lessons, uploads |
| **Instructor** | `marcus@totc.com` | `Password123!` | Create & edit courses, sections, lessons, uploads |
| **Student** | `student@totc.com` | `Password123!` | Enrolled in sample courses, leaves reviews, tracks progress |

---

## 🚀 Running the Backend

### 1. Requirements
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### 2. Start the API Server
```powershell
dotnet run --project backend\src\Elearning.API --launch-profile http
```
The API starts on: **`http://localhost:5000`**

### 3. Interactive Swagger Documentation
Open your browser at:
👉 **[http://localhost:5000/swagger](http://localhost:5000/swagger)**

---

## 🔌 Switching to Microsoft SQL Server / PostgreSQL

By default, the backend runs in zero-configuration SQLite mode (`elearning.db`) for immediate out-of-the-box local development.

To switch to **Microsoft SQL Server**, update `backend/src/Elearning.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TOTCElearningDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```
The backend automatically detects the `Server=` keyword in `Program.cs` and activates `options.UseSqlServer(connectionString)`.
