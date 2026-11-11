import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, X, ChevronDown, BookOpen, User, CreditCard, 
  LogOut, LayoutDashboard, Shield, Sparkles 
} from 'lucide-react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  openAuthModal, 
  isScrolled, 
  currentUser, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role-tailored navigation links
  let navLinks = [];
  if (currentUser?.role === 'Admin') {
    navLinks = [
      { name: 'Admin Console', id: 'admin-dashboard' },
      { name: 'Course Catalog', id: 'courses' },
      { name: 'Public Site', id: 'home' },
      { name: 'Blog', id: 'blog' },
    ];
  } else if (currentUser?.role === 'Instructor') {
    navLinks = [
      { name: 'Instructor Studio', id: 'instructor-dashboard' },
      { name: 'Course Catalog', id: 'courses' },
      { name: 'Home', id: 'home' },
      { name: 'Blog', id: 'blog' },
    ];
  } else {
    // Student or Guest
    navLinks = [
      { name: 'Home', id: 'home' },
      { name: 'Courses', id: 'courses' },
      ...(currentUser ? [{ name: 'My Learning', id: 'dashboard' }] : []),
      { name: 'Membership', id: 'membership' },
      { name: 'Blog', id: 'blog' },
    ];
  }

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLightNav = activePage !== 'home' || isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLightNav
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Diamond emblem matching Figma Polygon 2 */}
            <div
              className={`w-8 h-8 rounded-lg transform rotate-45 transition-transform duration-300 group-hover:rotate-90 shadow-md ${
                isLightNav ? 'bg-totc-teal' : 'bg-totc-teal border-2 border-white/40'
              }`}
            />
            <span className="absolute font-poppins font-black text-white text-xs tracking-wider">
              T
            </span>
          </div>
          <span
            className={`font-poppins font-bold text-2xl tracking-wider ${
              isLightNav ? 'text-totc-navy' : 'text-white'
            }`}
          >
            TOTC
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-base font-medium transition-all duration-200 relative py-1 focus:outline-none flex items-center gap-1.5 ${
                  isLightNav
                    ? isActive
                      ? 'text-totc-teal font-semibold'
                      : 'text-totc-gray hover:text-totc-navy'
                    : isActive
                    ? 'text-white font-semibold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.id === 'dashboard' && <BookOpen className="w-4 h-4 text-totc-teal" />}
                {link.name}
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                      isLightNav ? 'bg-totc-teal' : 'bg-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Action Buttons / User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar Dropdown Trigger */}
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/90 border border-gray-200/90 hover:border-totc-teal shadow-sm hover:shadow transition-all focus:outline-none group"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl || '/assets/testimonial_avatar.png'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-totc-teal"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-totc-navy leading-tight truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-totc-gray uppercase font-semibold">
                      {currentUser.role}
                    </span>
                    {currentUser.isSubscribed && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase tracking-wide">
                        PRO
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-totc-gray group-hover:text-totc-navy transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-totc-gray font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-totc-navy truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-totc-gray truncate">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-totc-teal-light text-totc-teal text-[10px] font-bold uppercase">
                        {currentUser.role}
                      </span>
                      {currentUser.isSubscribed && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wide">
                          ⭐ PRO ALL-ACCESS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links Tailored to Role */}
                  <div className="py-1">
                    {currentUser.role === 'Admin' && (
                      <>
                        <button
                          onClick={() => handleNavClick('admin-dashboard')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                            activePage === 'admin-dashboard' ? 'bg-totc-teal-light text-totc-teal font-semibold' : 'text-totc-navy hover:bg-gray-50'
                          }`}
                        >
                          <Shield className="w-4 h-4 text-indigo-600" />
                          <span>Admin Console</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('courses')}
                          className="w-full px-4 py-2 text-left text-sm text-totc-navy hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-totc-teal" />
                          <span>Course Catalog</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('instructor-dashboard')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                            activePage === 'instructor-dashboard' ? 'bg-totc-teal-light text-totc-teal font-semibold' : 'text-totc-navy hover:bg-gray-50'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span>Instructor Studio</span>
                        </button>
                      </>
                    )}

                    {currentUser.role === 'Instructor' && (
                      <>
                        <button
                          onClick={() => handleNavClick('instructor-dashboard')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                            activePage === 'instructor-dashboard' ? 'bg-totc-teal-light text-totc-teal font-semibold' : 'text-totc-navy hover:bg-gray-50'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span>Instructor Studio</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('courses')}
                          className="w-full px-4 py-2 text-left text-sm text-totc-navy hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-totc-teal" />
                          <span>Course Catalog</span>
                        </button>
                      </>
                    )}

                    {currentUser.role === 'Student' && (
                      <>
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                            activePage === 'dashboard' ? 'bg-totc-teal-light text-totc-teal font-semibold' : 'text-totc-navy hover:bg-gray-50'
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4 text-totc-teal" />
                          <span>My Learning Dashboard</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('courses')}
                          className="w-full px-4 py-2 text-left text-sm text-totc-navy hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-totc-cyan" />
                          <span>Explore Courses</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('membership')}
                          className="w-full px-4 py-2 text-left text-sm text-totc-navy hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-totc-orange" />
                          <span>Membership & Billing</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (setActivePage) setActivePage('login');
                  else if (openAuthModal) openAuthModal('login');
                }}
                className={`px-7 py-2.5 rounded-full font-medium text-base transition-all duration-200 shadow-sm hover:shadow ${
                  isLightNav
                    ? 'bg-totc-gray-light text-totc-navy hover:bg-gray-100'
                    : 'bg-white text-totc-gray-dark hover:bg-white/90'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  if (setActivePage) setActivePage('register');
                  else if (openAuthModal) openAuthModal('register');
                }}
                className={`px-7 py-2.5 rounded-full font-medium text-base transition-all duration-200 shadow-sm hover:shadow ${
                  isLightNav
                    ? 'bg-totc-teal text-white hover:bg-totc-teal-dark'
                    : 'bg-white/30 text-white hover:bg-white/40 backdrop-blur-sm'
                }`}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isLightNav ? 'text-totc-navy hover:bg-gray-100' : 'text-white hover:bg-white/20'
          }`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          {currentUser && (
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 mb-2">
              <img
                src={currentUser.avatarUrl || '/assets/testimonial_avatar.png'}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-full object-cover border border-totc-teal"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-totc-navy truncate">{currentUser.fullName}</p>
                <p className="text-xs text-totc-gray truncate">{currentUser.email}</p>
                <span className="text-[10px] font-bold text-totc-teal uppercase">{currentUser.role}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left text-base py-2.5 px-3 rounded-lg font-medium transition-colors ${
                  activePage === link.id
                    ? 'bg-totc-teal-light text-totc-teal font-semibold'
                    : 'text-totc-gray hover:text-totc-navy hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}

            {currentUser && currentUser.role === 'Admin' && (
              <button
                onClick={() => handleNavClick('instructor-dashboard')}
                className={`text-left text-base py-2.5 px-3 rounded-lg font-medium transition-colors ${
                  activePage === 'instructor-dashboard'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-totc-gray hover:text-purple-700 hover:bg-gray-50'
                }`}
              >
                Instructor Studio
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-full font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (setActivePage) setActivePage('login');
                    else if (openAuthModal) openAuthModal('login');
                  }}
                  className="w-full py-3 rounded-full font-medium text-base bg-gray-100 text-totc-navy hover:bg-gray-200 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (setActivePage) setActivePage('register');
                    else if (openAuthModal) openAuthModal('register');
                  }}
                  className="w-full py-3 rounded-full font-medium text-base bg-totc-teal text-white hover:bg-totc-teal-dark transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}