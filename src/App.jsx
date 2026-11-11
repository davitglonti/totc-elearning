import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import MembershipPage from './pages/MembershipPage';
import CheckoutPage from './pages/CheckoutPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import CreateCoursePage from './pages/CreateCoursePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AuthModal, VideoModal, AssessmentModal } from './components/Modals';
import { api } from './services/api';

/**
 * Generate clean, human-readable URL slugs for courses and articles with Unicode support
 */
const slugify = (text, id) => {
  if (!text && !id) return 'course';
  const clean = text
    ? text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\p{L}\p{N}\-]+/gu, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+|-+$/g, '')
    : '';
  return clean || (id ? String(id).substring(0, 8) : 'course');
};

/**
 * Maps page state to the browser's address bar URL path
 */
const getPathForPage = (page, course, playCourse) => {
  switch (page) {
    case 'home':
      return '/';
    case 'courses':
      return '/courses';
    case 'course-detail': {
      const active = course || playCourse;
      const slug = active ? (active.slug || slugify(active.title, active.id || active.courseId)) : 'overview';
      return `/courses/${slug}`;
    }
    case 'course-player': {
      const active = playCourse || course;
      const slug = active ? (active.slug || slugify(active.title, active.id || active.courseId)) : 'classroom';
      return `/learn/${slug}`;
    }
    case 'dashboard':
      return '/my-courses';
    case 'instructor-dashboard':
      return '/instructor/studio';
    case 'create-course':
      return '/instructor/courses/new';
    case 'edit-course':
      return '/instructor/courses/edit';
    case 'admin-dashboard':
      return '/admin';
    case 'membership':
      return '/membership';
    case 'blog':
      return '/blog';
    case 'blog-detail':
      return '/blog/edtech-trends-2026';
    case 'checkout':
      return '/checkout';
    default:
      return '/';
  }
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCourseToPlay, setActiveCourseToPlay] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [securityNotice, setSecurityNotice] = useState('');

  // Modals state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  useEffect(() => {
    // 1. Check local storage for existing session
    const user = api.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // 2. Synchronize route and load course from browser URL on initial visit or refresh (F5)
    const syncRouteFromUrl = async () => {
      const path = window.location.pathname.toLowerCase();

      try {
        const coursesRes = await api.courses.getAll({ pageSize: 50 });
        const allAvailableCourses = coursesRes.items || [];

        // Route: /learn/:courseSlug (Interactive Video Classroom)
        if (path.startsWith('/learn/')) {
          const rawSlug = decodeURIComponent(path.replace('/learn/', '').replace(/\/$/, ''));
          const matched = allAvailableCourses.find(c => 
            (c.id && c.id.toLowerCase() === rawSlug) || 
            (c.courseId && c.courseId.toLowerCase() === rawSlug) ||
            slugify(c.title, c.id) === rawSlug ||
            (c.title && c.title.toLowerCase().startsWith(rawSlug.replace(/-+$/, '')))
          ) || allAvailableCourses[0];
          if (matched) {
            setActiveCourseToPlay(matched);
            setSelectedCourse(matched);
          }
          setActivePage('course-player');
          return;
        }

        // Route: /courses/:courseSlug (Course Detail Page)
        if (path.startsWith('/courses/')) {
          const rawSlug = decodeURIComponent(path.replace('/courses/', '').replace(/\/$/, ''));
          if (rawSlug && rawSlug !== 'all' && rawSlug !== 'catalog') {
            const matched = allAvailableCourses.find(c => 
              (c.id && c.id.toLowerCase() === rawSlug) || 
              (c.courseId && c.courseId.toLowerCase() === rawSlug) ||
              slugify(c.title, c.id) === rawSlug ||
              (c.title && c.title.toLowerCase().startsWith(rawSlug.replace(/-+$/, '')))
            ) || allAvailableCourses[0];
            if (matched) {
              setSelectedCourse(matched);
            }
            setActivePage('course-detail');
            return;
          } else {
            setActivePage('courses');
            return;
          }
        }
      } catch (err) {
        console.warn('Could not sync course from URL:', err.message);
      }

      // Standard route mappings
      if (path === '/courses') {
        setActivePage('courses');
      } else if (path === '/my-courses' || path === '/dashboard') {
        setActivePage('dashboard');
      } else if (path === '/instructor/courses/new' || path === '/create-course') {
        setActivePage('create-course');
      } else if (path.startsWith('/instructor')) {
        setActivePage('instructor-dashboard');
      } else if (path === '/admin') {
        setActivePage('admin-dashboard');
      } else if (path === '/membership') {
        setActivePage('membership');
      } else if (path.startsWith('/blog/')) {
        setActivePage('blog-detail');
      } else if (path === '/blog') {
        setActivePage('blog');
      } else if (path === '/checkout') {
        setActivePage('checkout');
      } else {
        setActivePage('home');
      }
    };

    syncRouteFromUrl();

    // 3. Handle browser Back/Forward (← / →) buttons
    const handlePopState = () => {
      syncRouteFromUrl();
    };
    window.addEventListener('popstate', handlePopState);

    // 4. Glassmorphism navbar scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  /**
   * Protected Route Transition and Browser Address Bar URL Synchronization
   */
  const handleSafePageTransition = (targetPage, extraData = null) => {
    // Save relevant course payload if provided
    if (extraData) {
      if (targetPage === 'course-detail') {
        setSelectedCourse(extraData);
      } else if (targetPage === 'course-player') {
        setActiveCourseToPlay(extraData);
      }
    }

    // Guard: Student Dashboard & Course Player require authentication
    if ((targetPage === 'dashboard' || targetPage === 'course-player') && !currentUser) {
      setSecurityNotice('Please log in to access your personal courses and learning dashboard.');
      openAuthModal('login');
      return;
    }

    // Guard: Instructor Studio & Course Creation require Instructor or Admin role
    if (targetPage === 'instructor-dashboard' || targetPage === 'create-course' || targetPage === 'edit-course') {
      if (!currentUser) {
        setSecurityNotice('Instructor credentials required to access the Instructor Studio.');
        openAuthModal('login');
        return;
      }
      if (currentUser.role !== 'Instructor' && currentUser.role !== 'Admin') {
        setSecurityNotice('Access denied: You need an Instructor account to view this page.');
        setActivePage('dashboard');
        return;
      }
    }

    if (targetPage === 'edit-course') {
      if (extraData) setCourseToEdit(extraData);
    } else if (targetPage === 'create-course' && !extraData) {
      setCourseToEdit(null);
    }

    // Guard: Admin Console requires Admin role
    if (targetPage === 'admin-dashboard') {
      if (!currentUser) {
        setSecurityNotice('Admin credentials required to access the Admin Console.');
        openAuthModal('login');
        return;
      }
      if (currentUser.role !== 'Admin') {
        setSecurityNotice('Access denied: Administrator privileges required.');
        setActivePage('dashboard');
        return;
      }
    }

    setSecurityNotice('');
    setActivePage(targetPage);

    // Update Browser Address Bar URL with clean, SEO-friendly path
    const activeC = extraData || (targetPage === 'course-player' ? activeCourseToPlay : selectedCourse);
    const newPath = getPathForPage(targetPage, activeC, activeC);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ page: targetPage, path: newPath }, '', newPath);
    }
  };

  /**
   * Role-Based Redirection upon successful login or registration
   */
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setSecurityNotice('');

    if (!user) return;

    if (user.role === 'Instructor') {
      handleSafePageTransition('instructor-dashboard');
    } else if (user.role === 'Admin') {
      handleSafePageTransition('admin-dashboard');
    } else {
      handleSafePageTransition('dashboard');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setSecurityNotice('');
    handleSafePageTransition('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins text-totc-navy bg-white selection:bg-totc-teal selection:text-white">
      {/* Sticky/Floating Responsive Navbar with User Dropdown */}
      <Navbar
        activePage={activePage}
        setActivePage={handleSafePageTransition}
        openAuthModal={openAuthModal}
        isScrolled={isScrolled}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Security notice banner if unauthorized page was accessed */}
      {securityNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
          <span>⚠️ {securityNotice}</span>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        {activePage === 'home' && (
          <LandingPage
            openAuthModal={openAuthModal}
            openVideoModal={() => setVideoModalOpen(true)}
            openAssessmentModal={() => setAssessmentModalOpen(true)}
            setActivePage={handleSafePageTransition}
          />
        )}

        {/* Student Dashboard / My Courses (Protected) */}
        {activePage === 'dashboard' && (
          <StudentDashboardPage
            currentUser={currentUser}
            setActivePage={handleSafePageTransition}
            onSelectCourseToPlay={(course) => {
              setActiveCourseToPlay(course);
              handleSafePageTransition('course-player', course);
            }}
          />
        )}

        {/* Interactive Classroom Video Player (Protected) */}
        {activePage === 'course-player' && (
          <CoursePlayerPage
            activeCourse={activeCourseToPlay}
            setActivePage={handleSafePageTransition}
            currentUser={currentUser}
          />
        )}

        {/* Instructor Studio (Protected) */}
        {activePage === 'instructor-dashboard' && (
          <InstructorDashboardPage
            currentUser={currentUser}
            setActivePage={handleSafePageTransition}
            onEditCourse={(course) => {
              setCourseToEdit(course);
              handleSafePageTransition('edit-course', course);
            }}
            setSelectedCourse={(course) => {
              setSelectedCourse(course);
              handleSafePageTransition('course-detail', course);
            }}
          />
        )}

        {/* Course Creation & Editing Studio (Protected) */}
        {(activePage === 'create-course' || activePage === 'edit-course') && (
          <CreateCoursePage
            currentUser={currentUser}
            courseToEdit={courseToEdit}
            setActivePage={handleSafePageTransition}
            setSelectedCourse={(course) => {
              setSelectedCourse(course);
              handleSafePageTransition('course-detail', course);
            }}
          />
        )}

        {/* Admin Console (Protected) */}
        {activePage === 'admin-dashboard' && (
          <AdminDashboardPage
            currentUser={currentUser}
            setActivePage={handleSafePageTransition}
            setSelectedCourse={(course) => {
              setSelectedCourse(course);
              handleSafePageTransition('course-detail', course);
            }}
          />
        )}

        {activePage === 'courses' && (
          <CoursesPage
            setActivePage={handleSafePageTransition}
            setSelectedCourse={(course) => {
              setSelectedCourse(course);
              handleSafePageTransition('course-detail', course);
            }}
          />
        )}

        {activePage === 'course-detail' && (
          <CourseDetailPage
            selectedCourse={selectedCourse}
            setActivePage={handleSafePageTransition}
            openVideoModal={() => setVideoModalOpen(true)}
            currentUser={currentUser}
            onSelectCourseToPlay={(course) => {
              setActiveCourseToPlay(course);
              handleSafePageTransition('course-player', course);
            }}
          />
        )}

        {activePage === 'blog' && (
          <BlogPage setActivePage={handleSafePageTransition} />
        )}

        {activePage === 'blog-detail' && (
          <BlogDetailPage setActivePage={handleSafePageTransition} />
        )}

        {activePage === 'membership' && (
          <MembershipPage
            setActivePage={handleSafePageTransition}
            openAuthModal={openAuthModal}
            currentUser={currentUser}
            onSubscriptionUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}

        {activePage === 'checkout' && (
          <CheckoutPage setActivePage={handleSafePageTransition} />
        )}
      </main>

      {/* Global Footer (hidden on course-player for full distraction-free learning immersion) */}
      {activePage !== 'course-player' && (
        <Footer setActivePage={handleSafePageTransition} />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
        onAuthSuccess={handleAuthSuccess}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <AssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
      />
    </div>
  );
}
