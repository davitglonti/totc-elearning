import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, Clock, BookOpen, Award, ArrowRight, 
  Search, Filter, Sparkles, TrendingUp, AlertCircle, Compass 
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboardPage({ currentUser, setActivePage, onSelectCourseToPlay }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in-progress', 'completed'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadMyCourses() {
      setLoading(true);
      setError('');
      try {
        const myCourses = await api.enrollments.getMyCourses();
        setCourses(myCourses || []);
      } catch (err) {
        console.warn('Could not load enrolled courses from API:', err.message);
        setError('Failed to sync with live courses server. Showing offline state.');
      } finally {
        setLoading(false);
      }
    }

    loadMyCourses();
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
                Student Learning Space
              </div>

              {currentUser?.isSubscribed && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black tracking-wide uppercase shadow-sm border border-amber-200">
                  <span>⭐ {currentUser.subscriptionPlan || 'PRO'} ALL-ACCESS ACTIVE</span>
                </div>
              )}
            </div>

            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy">
              Welcome back, {currentUser?.fullName || 'Student'}! 👋
            </h1>
            <p className="font-poppins text-totc-gray text-base">
              Pick up where you left off and achieve your learning milestones today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('courses')}
              className="px-6 py-3 rounded-full font-semibold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore Catalog
            </button>
            <button
              onClick={() => setActivePage('membership')}
              className="px-6 py-3 rounded-full font-semibold text-sm bg-white border border-gray-200 text-totc-navy hover:bg-gray-50 transition-all shadow-sm"
            >
              Upgrade to Pro
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
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Enrolled Courses</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{totalEnrolled}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Hours Learned</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{estimatedHours} hrs</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Completed Lessons</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{totalCompletedLessons}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Certificates</p>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy">{completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Featured "Continue Learning" Banner */}
        {continueCourse && (
          <div className="bg-gradient-to-r from-totc-navy to-[#1e2746] rounded-[28px] p-6 sm:p-8 text-white mb-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                  Resume Where You Left Off
                </span>
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-white">
                  {continueCourse.title}
                </h2>
                <p className="text-white/80 text-sm sm:text-base">
                  Instructor: <span className="font-semibold text-white">{continueCourse.instructorName}</span> • {continueCourse.completedLessonsCount || 0} of {continueCourse.totalLessonsCount || 10} lectures completed
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/90 font-medium">
                    <span>Course Progress</span>
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
                <span>Continue Learning</span>
              </button>
            </div>

            {/* Ambient background graphics */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-totc-teal/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Course Catalog Filter & Search Bar */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'in-progress'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-totc-teal text-white shadow-sm'
                    : 'text-totc-gray hover:text-totc-navy'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-totc-gray absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search my courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-totc-navy focus:outline-none focus:border-totc-teal focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid or Empty State */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-totc-teal border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-totc-gray text-sm">Loading your personal learning curriculum...</p>
          </div>
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
                      Completed
                    </div>
                  ) : course.isProAccess ? (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-[11px] shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Pro Unlocked
                    </div>
                  ) : null}
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                      Instructor: {course.instructorName}
                    </p>
                    <h3 className="font-poppins font-bold text-lg text-totc-navy line-clamp-2 leading-snug group-hover:text-totc-teal transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  {/* Progress & Lessons Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs text-totc-gray font-medium">
                      <span>{course.completedLessonsCount || 0} / {course.totalLessonsCount || 10} Lessons</span>
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

                  {/* Action Button */}
                  <button
                    onClick={() => handleStartLearning(course)}
                    className="w-full py-3 rounded-full font-semibold text-sm bg-totc-teal-light text-totc-teal hover:bg-totc-teal hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>{course.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}</span>
                  </button>
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
                თქვენ ჯერ არ გაქვთ კურსები (No Enrolled Courses Yet)
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
                <span>Explore Courses</span>
              </button>

              <button
                onClick={() => setActivePage('membership')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm bg-totc-orange text-white hover:bg-[#e07f04] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro Plan</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}