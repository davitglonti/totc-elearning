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
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AuthModal, VideoModal, AssessmentModal } from './components/Modals';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCourseToPlay, setActiveCourseToPlay] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [securityNotice, setSecurityNotice] = useState('');

  // Modals state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  useEffect(() => {
    // Check local storage for existing session
    const user = api.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  /**
   * Role-Based Redirection upon successful login or registration
   * - Student: Redirects to Student Dashboard / My Courses
   * - Instructor: Redirects to Instructor Studio
   * - Admin: Redirects to Admin Console
   */
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setSecurityNotice('');

    if (!user) return;

    if (user.role === 'Instructor') {
      setActivePage('instructor-dashboard');
    } else if (user.role === 'Admin') {
      setActivePage('admin-dashboard');
    } else {
      // Default Student Flow (Udemy / Coursera / Skillshare style)
      setActivePage('dashboard');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setActivePage('home');
    setSecurityNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Protected Route Guards
   * Validates access permissions before rendering sensitive pages
   */
  const handleSafePageTransition = (targetPage) => {
    // Guard: Student Dashboard & Course Player require authentication
    if ((targetPage === 'dashboard' || targetPage === 'course-player') && !currentUser) {
      setSecurityNotice('Please log in to access your personal courses and learning dashboard.');
      openAuthModal('login');
      return;
    }

    // Guard: Instructor Studio requires Instructor or Admin role
    if (targetPage === 'instructor-dashboard') {
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
            onSelectCourseToPlay={(course) => setActiveCourseToPlay(course)}
          />
        )}

        {/* Interactive Classroom Video Player (Protected) */}
        {activePage === 'course-player' && (
          <CoursePlayerPage
            activeCourse={activeCourseToPlay}
            setActivePage={handleSafePageTransition}
          />
        )}

        {/* Instructor Studio (Protected) */}
        {activePage === 'instructor-dashboard' && (
          <InstructorDashboardPage
            currentUser={currentUser}
            setActivePage={handleSafePageTransition}
            setSelectedCourse={setSelectedCourse}
          />
        )}

        {/* Admin Console (Protected) */}
        {activePage === 'admin-dashboard' && (
          <AdminDashboardPage
            currentUser={currentUser}
            setActivePage={handleSafePageTransition}
          />
        )}

        {activePage === 'courses' && (
          <CoursesPage
            setActivePage={handleSafePageTransition}
            setSelectedCourse={setSelectedCourse}
          />
        )}

        {activePage === 'course-detail' && (
          <CourseDetailPage
            selectedCourse={selectedCourse}
            setActivePage={handleSafePageTransition}
            openVideoModal={() => setVideoModalOpen(true)}
            currentUser={currentUser}
            onSelectCourseToPlay={(course) => setActiveCourseToPlay(course)}
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