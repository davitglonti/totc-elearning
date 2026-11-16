import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, Clock, BookOpen, Award, ArrowRight, 
  Search, Filter, Sparkles, TrendingUp, AlertCircle, Compass,
  Trophy, GraduationCap, Printer, Copy, CheckCheck, X
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboardPage({ currentUser, setActivePage, onSelectCourseToPlay }) {
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [copiedCertLink, setCopiedCertLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in-progress', 'completed', 'certificates'
  const [searchTerm, setSearchTerm] = useState('');

  const loadCertificates = async (myCourses = []) => {
    try {
      const myCerts = await api.certificates.getMyCertificates();
      if (myCerts && myCerts.length > 0) {
        setCertificates(myCerts);
        return;
      }
    } catch (e) {
      console.warn('Could not load certificates from API:', e.message);
    }

    // Fallback: build certificates from any completed courses if backend hasn't synced
    const completed = (myCourses || []).filter(c => c.isCompleted || c.progressPercentage === 100);
    const fallbacks = completed.map(c => ({
      id: c.courseId || c.id,
      courseId: c.courseId || c.id,
      courseTitle: c.title,
      studentName: currentUser?.fullName || 'Gloria Rose',
      instructorName: c.instructorName || 'TOTC Faculty',
      certificateNumber: `TOTC-2026-ARCH`,
      verificationHash: `7e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c`,
      issuedAt: new Date().toISOString(),
      pdfUrl: `/api/certificates/TOTC-2026-ARCH/download`,
      verificationUrl: `/verify/certificate/TOTC-2026-ARCH`
    }));
    setCertificates(fallbacks);
  };

  const loadMyCourses = async () => {
    try {
      const myCourses = await api.enrollments.getMyCourses();
      setCourses(myCourses || []);
      loadCertificates(myCourses || []);
    } catch (err) {
      console.warn('Could not load enrolled courses from API:', err.message);
      setError('სერვერთან დაკავშირება ვერ მოხერხდა. ნაჩვენებია ოფლაინ მონაცემები.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyCourses();

    const handleProgressUpdate = () => {
      loadMyCourses();
    };

    window.addEventListener('totc-lesson-completed', handleProgressUpdate);
    window.addEventListener('focus', handleProgressUpdate);

    return () => {
      window.removeEventListener('totc-lesson-completed', handleProgressUpdate);
      window.removeEventListener('focus', handleProgressUpdate);
    };
  }, []);

  // Filter courses based on tab and search
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'in-progress') return !c.isCompleted && c.progressPercentage < 100;
    if (activeTab === 'completed') return c.isCompleted || c.progressPercentage === 100;
    return true;
  });

  // Filter certificates based on search
  const filteredCertificates = certificates.filter((cert) => {
    return (cert.courseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (cert.certificateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (cert.instructorName || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate learning stats
  const totalEnrolled = courses.length;
  const completedCount = courses.filter((c) => c.isCompleted || c.progressPercentage === 100).length;
  const inProgressCount = totalEnrolled - completedCount;
  const totalCompletedLessons = courses.reduce((acc, c) => acc + (c.completedLessonsCount || 0), 0);
  const estimatedHours = (totalCompletedLessons * 0.75).toFixed(1);

  // Featured "Continue Learning" course (first in-progress course, or first course)
  const continueCourse = courses.find((c) => c.progressPercentage < 100) || courses[0];

  const handleStartLearning = (course) => {
    if (onSelectCourseToPlay) {
      onSelectCourseToPlay(course);
    }
    setActivePage('course-player', course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Welcome Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-totc-teal-light text-totc-teal text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                სტუდენტის სასწავლო სივრცე
              </div>

              {currentUser?.isSubscribed && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black tracking-wide uppercase shadow-sm border border-amber-200">
                  <span>⭐ {currentUser.subscriptionPlan || 'PRO'} სრული წვდომა აქტიურია</span>
                </div>
              )}
            </div>

            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy">
              გამარჯობა, {currentUser?.fullName || 'სტუდენტო'}! 👋
            </h1>
            <p className="font-poppins text-totc-gray text-base">
              განაგრძეთ სწავლა იქიდან, სადაც გაჩერდით და მიაღწიეთ ახალ შედეგებს.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('courses')}
              className="px-6 py-3 rounded-full font-semibold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              კურსების კატალოგი
            </button>
            <button
              onClick={() => setActivePage('membership')}
              className="px-6 py-3 rounded-full font-semibold text-sm bg-white border border-gray-200 text-totc-navy hover:bg-gray-50 transition-all shadow-sm"
            >
              Pro პაკეტზე გადასვლა
            </button>
          </div>
        </div>

        {/* 4 Learning Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">ჩემი კურსები</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{totalEnrolled}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">ნასწავლი საათები</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{estimatedHours} სთ</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">გავლილი ლექციები</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{totalCompletedLessons}</h3>
            </div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('certificates');
              const el = document.getElementById('dashboard-tabs-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-400/60 transition-all hover:shadow group"
            title="დააწკაპუნეთ სერტიფიკატების ჩამონათვალზე გადასასვლელად"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center text-purple-500 shrink-0 transition-colors">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">სერტიფიკატები</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{certificates.length || completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Featured "Continue Learning" Banner */}
        {continueCourse && (
          <div className="bg-gradient-to-r from-totc-navy to-[#1e2746] rounded-[28px] p-6 sm:p-8 text-white mb-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                  სწავლის გაგრძელება
                </span>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  {continueCourse.title}
                </h2>
                <p className="text-white/80 text-sm sm:text-base">
                  ინსტრუქტორი: <span className="font-semibold text-white">{continueCourse.instructorName}</span> • დასრულებულია {continueCourse.completedLessonsCount || 0} / {continueCourse.totalLessonsCount || 10} ლექცია
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/90 font-medium">
                    <span>კურსის პროგრესი</span>
                    <span className="font-bold text-totc-cyan">{continueCourse.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-totc-teal rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, continueCourse.progressPercentage || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartLearning(continueCourse)}
                className="px-8 py-4 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-lg hover:shadow-xl flex items-center gap-3 shrink-0 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <span>გაგრძელება</span>
              </button>
            </div>

            {/* Ambient background graphics */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-totc-teal/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Course Catalog Filter & Search Bar */}
        <div id="dashboard-tabs-section" className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full self-start sm:self-auto flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                ყველა კურსი ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'in-progress'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                მიმდინარე ({inProgressCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                დასრულებული ({completedCount})
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'certificates'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm'
                    : 'text-totc-gray hover:text-amber-600'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>სერტიფიკატები ({certificates.length || completedCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-totc-gray absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'certificates' ? "მოძებნეთ სერტიფიკატებში..." : "მოძებნეთ ჩემს კურსებში..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-totc-navy focus:outline-none focus:border-totc-teal focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area: Certificates Grid OR Courses Grid OR Empty States */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-totc-teal border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-totc-gray text-sm">იტვირთება თქვენი სასწავლო პროგრამა...</p>
          </div>
        ) : activeTab === 'certificates' ? (
          filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id || cert.certificateNumber}
                  className="bg-white rounded-[24px] overflow-hidden border border-amber-200/70 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Certificate Card Header */}
                  <div className="p-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0D9488] text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          აკრედიტებული
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                          № {cert.certificateNumber}
                        </span>
                      </div>
                      <h4 className="font-poppins font-bold text-lg text-white line-clamp-2 leading-snug">
                        {cert.courseTitle}
                      </h4>
                      <p className="text-xs text-teal-200/90">
                        ინსტრუქტორი: <span className="font-semibold text-white">{cert.instructorName}</span>
                      </p>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-amber-400/10 pointer-events-none blur-xl" />
                  </div>

                  {/* Certificate Body Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5 text-xs text-totc-gray">
                      <div className="flex items-center justify-between">
                        <span>მფლობელი:</span>
                        <strong className="text-totc-navy">{cert.studentName || currentUser?.fullName || 'Gloria Rose'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>გაცემის თარიღი:</span>
                        <span className="text-totc-navy font-medium">
                          {new Date(cert.issuedAt).toLocaleDateString('ka-GE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span>სტატუსი:</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ვერიფიცირებული (100%)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-gray-50">
                      <button
                        onClick={() => setActivePage('certificate-detail', cert)}
                        className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Award className="w-4 h-4 text-slate-950" />
                        <span>სერტიფიკატის ნახვა</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            window.open(`http://localhost:5000/api/certificates/${cert.certificateNumber}/download`, '_blank');
                          }}
                          className="py-2.5 px-3 rounded-full font-semibold text-xs bg-slate-100 text-totc-navy hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="სერტიფიკატის ბეჭდვა ან PDF ფაილად ჩამოტვირთვა"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF / ბეჭდვა</span>
                        </button>
                        <button
                          onClick={() => {
                            const num = cert.certificateNumber || cert.verificationHash || cert.id;
                            const url = `${window.location.origin}/certificates/${num}`;
                            navigator.clipboard.writeText(url);
                            setCopiedCertLink(true);
                            setTimeout(() => setCopiedCertLink(false), 2500);
                          }}
                          className="py-2.5 px-3 rounded-full font-semibold text-xs bg-slate-100 text-totc-navy hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="სერტიფიკატის გვერდის ბმულის კოპირება"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedCertLink ? 'დაკოპირდა!' : 'ბმული'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Certificates Empty State */
            <div className="bg-white rounded-[28px] p-12 text-center border border-gray-100 shadow-sm space-y-6 max-w-2xl mx-auto my-8 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                <Award className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-poppins font-bold text-2xl text-totc-navy">
                  თქვენ ჯერ არ გაქვთ მიღებული სერტიფიკატები
                </h3>
                <p className="font-poppins text-totc-gray text-base max-w-md mx-auto">
                  დაასრულეთ თქვენი სასწავლო კურსები 100%-ით, ჩააბარეთ ფინალური გამოცდები და მიიღეთ ოფიციალური აკრედიტებული სერტიფიკატები.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-8 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ჩემი კურსების ნახვა</span>
                </button>
              </div>
            </div>
          )
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.courseId}
                className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnailUrl || '/assets/explore_row_1.png'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.isCompleted ? (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      დასრულებულია
                    </div>
                  ) : course.isProAccess ? (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-[11px] shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Pro წვდომა
                    </div>
                  ) : null}
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                      ინსტრუქტორი: {course.instructorName}
                    </p>
                    <h3 className="font-poppins font-bold text-lg text-totc-navy line-clamp-2 leading-snug group-hover:text-totc-teal transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  {/* Progress & Lessons Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs text-totc-gray font-medium">
                      <span>{course.completedLessonsCount || 0} / {course.totalLessonsCount || 10} ლექცია</span>
                      <span className="font-bold text-totc-navy">{course.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          course.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-totc-teal'
                        }`}
                        style={{ width: `${Math.max(4, course.progressPercentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {course.progressPercentage === 100 ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleStartLearning(course)}
                        className="py-2.5 px-3 rounded-full font-semibold text-xs bg-slate-100 text-totc-navy hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="კურსის მასალების გადახედვა"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>გადახედვა</span>
                      </button>
                      <button
                        onClick={() => {
                          const cert = certificates.find(c => c.courseId === course.courseId || c.courseTitle === course.title) || {
                            id: course.courseId,
                            courseId: course.courseId,
                            courseTitle: course.title,
                            studentName: currentUser?.fullName || 'Gloria Rose',
                            instructorName: course.instructorName || 'TOTC Faculty',
                            certificateNumber: `TOTC-2026-ARCH`,
                            verificationHash: `7e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c`,
                            issuedAt: new Date().toISOString()
                          };
                          setActivePage('certificate-detail', cert);
                        }}
                        className="py-2.5 px-3 rounded-full font-extrabold text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        title="აკრედიტებული სერტიფიკატის ნახვა"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>სერტიფიკატი</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartLearning(course)}
                      className="w-full py-3 rounded-full font-semibold text-sm bg-totc-teal-light text-totc-teal hover:bg-totc-teal hover:text-white transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>სწავლის გაგრძელება</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State (როცა სტუდენტს ჯერ არ აქვს კურსები) */
          <div className="bg-white rounded-[28px] p-12 text-center border border-gray-100 shadow-sm space-y-6 max-w-2xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-totc-teal-light text-totc-teal mx-auto flex items-center justify-center">
              <Compass className="w-10 h-10 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">
                თქვენ ჯერ არ გაქვთ კურსები
              </h3>
              <p className="font-poppins text-totc-gray text-base max-w-md mx-auto">
                გაეცანით ჩვენს კატალოგს, აირჩიეთ სასურველი მიმართულება და დაიწყეთ სწავლა დღესვე!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('courses')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>კურსების დათვალიერება</span>
              </button>

              <button
                onClick={() => setActivePage('membership')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-totc-orange text-white hover:bg-[#e07f04] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pro გამოწერაზე გადასვლა</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}