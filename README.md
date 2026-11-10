# TOTC - Full-Stack E-Learning & LMS Platform

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-teal.svg)](https://tailwindcss.com/)
[![Entity Framework Core](https://img.shields.io/badge/EF%20Core-9.0-512BD4.svg)](https://learn.microsoft.com/ef/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, pixel-perfect Learning Management System (LMS) built from Figma design specifications. Features an interactive **React 19** frontend and an **ASP.NET Core 9 Clean Architecture** Web API backend with Entity Framework Core, JWT authentication, and Swagger documentation.

---

## 🚀 Key Features

* **🎨 Figma-Fidelity Frontend:** Pixel-perfect visual identity matching TOTC design tokens (`#49BBBD`, `#00CBB8`, `#2F327D`, `#F48C06`).
* **🔐 Complete Authentication & Authorization:**
  * JWT Bearer token generation with BCrypt password hashing.
  * Role-based access control (`Student`, `Instructor`, `Admin`).
  * Protected route guards preventing unauthorized access.
* **🎓 Post-Login User Flows (Udemy / Coursera / Skillshare style):**
  * **Student Dashboard (`/dashboard`):** Real-time course progress tracking, learning hours, completed lectures, certificates, and "Continue Learning" quick resume banner.
  * **Empty State:** Dedicated onboarding view with catalog and subscription triggers.
  * **Interactive Video Classroom (`/course-player`):** Video playback, module syllabus accordion, and real-time "Mark as Complete" persistence to database.
  * **Instructor Studio (`/instructor-dashboard`):** Course creation modal, curriculum management, revenue metrics, and lecture video uploads.
  * **Admin Console (`/admin-dashboard`):** System health telemetry, database engine status, and Swagger links.
* **💳 Checkout & Webhook Workflow:** Promo discount support (`TOTC`, `TOTC2026`) and automated enrollment webhook handling.
* **🗄️ Universal Database Engine:** Out-of-the-box zero-setup SQLite (`elearning.db`), with instant switch to **Microsoft SQL Server** or **PostgreSQL** via connection string.

---

## 🏗️ Architecture

```
elearning/
├── src/                          # React 19 Frontend
│   ├── components/               # Navbar, Hero, Features, CloudSoftware, Modals, Footer
│   ├── pages/                    # LandingPage, CoursesPage, CourseDetailPage,
│   │                             # StudentDashboardPage, CoursePlayerPage,
│   │                             # InstructorDashboardPage, AdminDashboardPage,
│   │                             # BlogPage, MembershipPage, CheckoutPage
│   └── services/api.js           # API client with JWT interceptor
│
├── backend/                      # ASP.NET Core 9 Clean Architecture
│   ├── Elearning.sln
│   └── src/
│       ├── Elearning.Domain/          # User, Course, Section, Lesson, Enrollment, Review
│       ├── Elearning.Application/     # DTOs, Business Interfaces, Validation
│       ├── Elearning.Infrastructure/  # EF Core DbContext, SeedData, JWT, Services
│       └── Elearning.API/             # Controllers, Swagger, Middlewares, Program.cs
│
├── public/assets/                # High-resolution Figma extracted visual assets
├── test_system.ps1               # Automated end-to-end test verification script
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### 2. Run the Backend API (.NET 9)
```powershell
cd backend
dotnet restore
dotnet run --project src/Elearning.API --launch-profile http
```
* **API Base URL:** `http://localhost:5000`
* **Swagger UI Documentation:** `http://localhost:5000/swagger`

### 3. Run the Frontend (React 19 + Vite)
In a separate terminal:
```powershell
npm install
npm run dev
```
* **Frontend Web App:** `http://localhost:5173`

---

## 🧪 Automated Testing

Run the included verification suite to validate all 8 core API pipelines and frontend services in under 2 seconds:
```powershell
powershell -ExecutionPolicy Bypass -File .\test_system.ps1
```

---

## 🔑 Pre-Seeded Test Accounts

| Role | Email | Password | Scope |
|---|---|---|---|
| **Student** | `student@totc.com` | `Password123!` | Enrolled in 3 courses with progress tracking |
| **Instructor** | `lina@totc.com` | `Password123!` | Cloud Architecture course author |
| **Instructor** | `marcus@totc.com` | `Password123!` | UI/UX Design course author |
| **Admin** | `admin@totc.com` | `Password123!` | Full system administration and Swagger access |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
