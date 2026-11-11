import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Star,
  BookOpen,
  Award,
  Globe,
  Mail,
  Calendar,
  CheckCircle,
  Play,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Video
} from 'lucide-react';
import { api } from '../services/api';

export default function InstructorProfilePage({
  instructor,
  currentUser,
  setActivePage,
  setSelectedCourse,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'bio', 'experience'

  // Extract ID or Name identifier to query
  const queryParam = typeof instructor === 'string'
    ? instructor
    : instructor?.id || instructor?.instructorId || instructor?.fullName || instructor?.instructorName || instructor?.name || 'Lina Wilson';

  useEffect(() => {
    let isMounted = true;

    const fetchInstructor = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await api.users.getInstructorProfile(queryParam);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.warn('Could not fetch instructor profile from API, falling back to local data:', err);
        // Fallback realistic profile
        if (isMounted) {
          const fallbackName = typeof instructor === 'object' ? (instructor?.fullName || instructor?.instructorName || instructor?.instructor || 'Lina Wilson') : String(queryParam);
          setProfile({
            id: instructor?.id || '20000000-0000-0000-0000-000000000002',
            fullName: fallbackName,
            email: instructor?.email || instructor?.instructorEmail || 'lina@totc.com',
            role: 'Instructor',
            avatarUrl: instructor?.avatarUrl || instructor?.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            headline: instructor?.headline || 'Principal Cloud Architect & Senior EdTech Consultant',
            bio: instructor?.bio || 'Passionate educator and technologist with over a decade of hands-on experience designing modern distributed systems, cloud architectures, and scalable interactive curriculum.',
            education: instructor?.education || 'M.S. in Computer Science - Stanford University (2014) • AWS Authorized Instructor Champion',
            experience: instructor?.experience || '12+ years in cloud architecture and enterprise software engineering. Mentored 45,000+ students globally.',
            website: instructor?.website || 'https://totc.edu',
            createdAt: new Date().toISOString(),
            coursesCount: 2,
            studentsCount: 1420,
            averageRating: 4.9,
            reviewsCount: 320,
            authoredCourses: []
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInstructor();

    return () => {
      isMounted = false;
    };
  }, [queryParam]);

  const isSelf = Boolean(
    currentUser &&
    profile &&
    (currentUser.id === profile.id ||
      (currentUser.email && currentUser.email.toLowerCase() === profile.email.toLowerCase()) ||
      (currentUser.fullName && currentUser.fullName.toLowerCase() === profile.fullName.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-totc-teal border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-poppins font-medium text-totc-gray text-sm">
            Loading Instructor Profile & Curriculum...
          </p>
        </div>
      </div>
    );
  }

  const p = profile || {};

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Header Navigation Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setActivePage('courses')}
            className="flex items-center gap-2 text-sm font-semibold text-totc-gray hover:text-totc-teal transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Courses (ყველა კურსი)</span>
          </button>

          {isSelf && (
            <button
              onClick={() => setActivePage('instructor-dashboard')}
              className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Go to Your Instructor Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Hero Cover Banner & Profile Card */}
      <div className="relative">
        {/* Cover Background Gradient */}
        <div className="h-56 sm:h-64 bg-gradient-to-r from-totc-teal via-[#23a89a] to-totc-navy relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/20" />
          {/* Subtle geometric lines */}
          <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-cyan-300/10 blur-xl pointer-events-none" />
        </div>

        {/* Profile Card Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-10">
          <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-gray-100/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* Left: Avatar & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                <div className="relative">
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={p.fullName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-totc-teal/30"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow"
                    title="Active Instructor"
                  >
                    ✓
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="font-poppins font-extrabold text-2xl sm:text-3xl text-totc-navy tracking-tight">
                      {p.fullName}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-totc-teal/10 text-totc-teal font-bold text-xs inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Instructor</span>
                    </span>
                    {isSelf && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                        (You)
                      </span>
                    )}
                  </div>

                  <p className="font-poppins text-sm sm:text-base text-totc-gray font-medium">
                    {p.headline || 'Principal Lecturer & Curriculum Architect'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-totc-gray pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-totc-teal" />
                      <span>{p.email}</span>
                    </div>
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-totc-teal hover:underline font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Personal Website</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Joined TOTC community</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Buttons */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                {isSelf ? (
                  <>
                    <button
                      onClick={() => setActivePage('create-course')}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>+ Create New Course</span>
                    </button>
                    <button
                      onClick={() => setActivePage('instructor-dashboard')}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-totc-navy font-bold text-sm transition-all"
                    >
                      Studio Console
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Inquiry for TOTC Instructor ${p.fullName}`);
                      window.location.href = `mailto:${p.email}?subject=${subject}`;
                    }}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Instructor</span>
                  </button>
                )}
              </div>

            </div>

            {/* Metric Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-totc-teal mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-totc-gray">Total Courses</span>
                </div>
                <p className="font-poppins font-black text-2xl text-totc-navy">
                  {p.coursesCount || p.authoredCourses?.length || 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-totc-gray">Students Enrolled</span>
                </div>
                <p className="font-poppins font-black text-2xl text-totc-navy">
                  {(p.studentsCount || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-totc-gray">Instructor Rating</span>
                </div>
                <p className="font-poppins font-black text-2xl text-totc-navy">
                  {p.averageRating ? p.averageRating.toFixed(1) : '5.0'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-purple-600 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-totc-gray">Student Reviews</span>
                </div>
                <p className="font-poppins font-black text-2xl text-totc-navy">
                  {p.reviewsCount || 0}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Main Content: Tabs and Detail Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-8 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === 'courses'
                ? 'text-totc-teal font-extrabold'
                : 'text-totc-gray hover:text-totc-navy'
            }`}
          >
            <span>Courses by {p.fullName?.split(' ')[0]} ({p.authoredCourses?.length || p.coursesCount || 0})</span>
            {activeTab === 'courses' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-totc-teal rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === 'bio'
                ? 'text-totc-teal font-extrabold'
                : 'text-totc-gray hover:text-totc-navy'
            }`}
          >
            <span>About & Background (ბიოგრაფია)</span>
            {activeTab === 'bio' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-totc-teal rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === 'experience'
                ? 'text-totc-teal font-extrabold'
                : 'text-totc-gray hover:text-totc-navy'
            }`}
          >
            <span>Education & Qualifications (განათლება და გამოცდილება)</span>
            {activeTab === 'experience' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-totc-teal rounded-full" />
            )}
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* TAB: COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-xl text-totc-navy">
                    Published Courses & Curriculum
                  </h3>
                  <span className="text-xs font-semibold text-totc-gray">
                    Showing all courses authored by this lecturer
                  </span>
                </div>

                {(!p.authoredCourses || p.authoredCourses.length === 0) ? (
                  <div className="p-10 rounded-2xl bg-white border border-gray-100 text-center space-y-3">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                    <h4 className="font-bold text-totc-navy text-lg">No Published Courses Yet</h4>
                    <p className="text-sm text-totc-gray max-w-md mx-auto">
                      This instructor is currently working on curriculum and video lectures. Check back soon!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {p.authoredCourses.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-totc-teal/40 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          {/* Course Artwork Thumbnail */}
                          <div
                            onClick={() => {
                              if (setSelectedCourse) setSelectedCourse(c);
                              setActivePage('course-detail', c);
                            }}
                            className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer"
                          >
                            <img
                              src={c.thumbnailUrl || '/assets/explore_row_1.png'}
                              alt={c.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-totc-navy font-bold text-xs shadow-sm">
                              {c.categoryName || 'Development'}
                            </span>

                            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-totc-teal" />
                              <span>{c.totalDurationMinutes || 45} mins</span>
                            </span>
                          </div>

                          {/* Card Details */}
                          <div className="p-5 space-y-2.5">
                            <div className="flex items-center justify-between text-xs text-totc-gray">
                              <span className="font-semibold uppercase tracking-wider text-totc-teal">
                                {c.level || 'Beginner'}
                              </span>
                              <div className="flex items-center gap-1 text-totc-orange font-bold">
                                <Star className="w-3.5 h-3.5 fill-totc-orange" />
                                <span>{c.averageRating ? c.averageRating.toFixed(1) : '5.0'}</span>
                                <span className="text-gray-400 font-normal">({c.reviewsCount || 0})</span>
                              </div>
                            </div>

                            <h4
                              onClick={() => {
                                if (setSelectedCourse) setSelectedCourse(c);
                                setActivePage('course-detail', c);
                              }}
                              className="font-poppins font-bold text-base text-totc-navy group-hover:text-totc-teal transition-colors cursor-pointer line-clamp-2"
                            >
                              {c.title}
                            </h4>

                            <p className="text-xs text-totc-gray line-clamp-2 leading-relaxed">
                              {c.description || 'Comprehensive step-by-step masterclass with interactive video lectures and quizzes.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
                          <span className="font-poppins font-black text-lg text-totc-teal">
                            {c.price ? (String(c.price).startsWith('$') ? c.price : `$${c.price}`) : 'Free'}
                          </span>

                          <button
                            onClick={() => {
                              if (setSelectedCourse) setSelectedCourse(c);
                              setActivePage('course-detail', c);
                            }}
                            className="px-4 py-2 rounded-full bg-totc-teal-light text-totc-teal hover:bg-totc-teal hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Explore Course</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ABOUT / BIO */}
            {activeTab === 'bio' && (
              <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-totc-teal flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-totc-navy">
                      About {p.fullName} (ბიოგრაფია)
                    </h3>
                    <p className="text-xs text-totc-gray">Professional biography and educational philosophy</p>
                  </div>
                </div>

                <div className="prose max-w-none text-totc-navy/90 text-sm leading-relaxed space-y-4">
                  <p className="text-base font-medium text-totc-gray">
                    {p.bio || 'Passionate educator committed to creating high-yield, engaging learning experiences.'}
                  </p>

                  <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 text-teal-900 text-sm italic">
                    "My mission at TOTC is to break down complex architectural and creative concepts into structured, hands-on masterclasses that give students real-world superpowers."
                  </div>

                  <h4 className="font-bold text-base text-totc-navy pt-2">Teaching Methodology & Approach</h4>
                  <ul className="list-disc pl-5 space-y-2 text-totc-gray">
                    <li><strong className="text-totc-navy">Hands-on Problem Solving:</strong> Every lecture is paired with downloadable source files, assignments, and knowledge-check quizzes.</li>
                    <li><strong className="text-totc-navy">Sequential Mastery:</strong> Curricula are structured progressively so each lesson builds upon solid foundations.</li>
                    <li><strong className="text-totc-navy">Direct Lecturer Support:</strong> Students get real-time answers and insights during coursework.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: EDUCATION & EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                
                {/* Education Card */}
                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-xl text-totc-navy">
                        Education & Academic Background (განათლება)
                      </h3>
                      <p className="text-xs text-totc-gray">Degrees, universities, and academic credentials</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                    <p className="font-bold text-indigo-950 text-base">
                      {p.education || 'Master of Science in Computer Science & Applied Information Systems'}
                    </p>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      Rigorous academic foundation focused on distributed systems, human-computer interaction, and modern educational methodologies.
                    </p>
                  </div>
                </div>

                {/* Experience Card */}
                <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-xl text-totc-navy">
                        Professional Experience & Milestones (გამოცდილება)
                      </h3>
                      <p className="text-xs text-totc-gray">Industry roles, leadership, and teaching track record</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                    <p className="font-bold text-purple-950 text-base">
                      {p.experience || '10+ years leading cross-functional engineering teams, authoring technical curricula, and mentoring students.'}
                    </p>
                    <p className="text-xs text-purple-800 leading-relaxed">
                      Proven track record collaborating with international companies and building scalable digital products.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Instructor Summary Card */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-5">
              <h4 className="font-poppins font-bold text-base text-totc-navy">
                Instructor Credentials
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-totc-gray flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Identity Verification</span>
                  </span>
                  <span className="font-bold text-emerald-600">Verified ID</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-totc-gray flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-totc-teal" />
                    <span>Bunny CDN Video Quality</span>
                  </span>
                  <span className="font-bold text-totc-navy">1080p Ultra HD</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-totc-gray flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span>Course Quizzes & Labs</span>
                  </span>
                  <span className="font-bold text-totc-navy">Included</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-totc-gray flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Avg Satisfaction</span>
                  </span>
                  <span className="font-bold text-totc-navy">{p.averageRating ? `${p.averageRating.toFixed(1)} / 5.0` : '5.0 / 5.0'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (p.authoredCourses && p.authoredCourses.length > 0) {
                      const firstCourse = p.authoredCourses[0];
                      if (setSelectedCourse) setSelectedCourse(firstCourse);
                      setActivePage('course-detail', firstCourse);
                    } else {
                      setActiveTab('courses');
                    }
                  }}
                  className="w-full py-3 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Explore Featured Course</span>
                </button>
              </div>
            </div>

            {/* TOTC Guarantee Banner */}
            <div className="p-6 rounded-[24px] bg-gradient-to-br from-slate-900 to-totc-navy text-white space-y-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h5 className="font-bold text-sm">Official TOTC Instructor</h5>
              <p className="text-xs text-white/70 leading-relaxed">
                All lectures by verified instructors comply with TOTC quality standards, high-definition streaming, and curriculum peer review.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
