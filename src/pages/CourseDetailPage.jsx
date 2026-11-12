import React, { useState, useEffect } from 'react';
import { 
  Star, Play, CheckCircle, Clock, BookOpen, Award, ShieldCheck, 
  ArrowRight, User, Sparkles, Lock, Unlock, Video, HelpCircle, 
  Layers, ArrowLeft, Edit3
} from 'lucide-react';
import { api } from '../services/api';

export default function CourseDetailPage({ 
  selectedCourse, 
  setActivePage, 
  openVideoModal, 
  currentUser, 
  onSelectCourseToPlay 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Initialize course data with fallback
  const defaultFallback = {
    id: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    courseId: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    title: 'AWS Certified Solutions Architect & Cloud Operations',
    category: 'Cloud Architecture & DevOps',
    instructor: 'Lina Wilson',
    instructorEmail: 'lina@totc.com',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 1420,
    hours: '32 hrs',
    students: '12,500',
    price: '$450',
    oldPrice: '$600',
    image: '/assets/explore_row_1.png',
    sections: []
  };

  const [courseData, setCourseData] = useState(() => {
    if (!selectedCourse) return defaultFallback;
    return {
      ...defaultFallback,
      ...selectedCourse,
      id: selectedCourse.id || selectedCourse.courseId,
      instructor: selectedCourse.instructor || selectedCourse.instructorName || '',
      instructorEmail: selectedCourse.instructorEmail || '',
      instructorId: selectedCourse.instructorId || '',
      category: selectedCourse.category || selectedCourse.categoryName || '',
      price: selectedCourse.price ? (String(selectedCourse.price).startsWith('$') ? selectedCourse.price : `$${selectedCourse.price}`) : defaultFallback.price
    };
  });

  // Fetch full and up-to-date course syllabus, sections, and enrollment status from API
  useEffect(() => {
    const targetCourseId = selectedCourse?.id || selectedCourse?.courseId;
    if (!targetCourseId) return;

    let isMounted = true;
    setLoadingDetails(true);

    api.courses.getById(targetCourseId)
      .then(data => {
        if (isMounted && data) {
          setCourseData(prev => ({
            ...prev,
            ...data,
            id: data.id,
            courseId: data.id,
            title: data.title || prev.title,
            description: data.description || prev.description,
            category: data.categoryName || prev.category,
            instructor: data.instructorName || prev.instructor,
            instructorEmail: data.instructorEmail || '',
            instructorAvatar: data.instructorAvatar || prev.instructorAvatar,
            instructorId: data.instructorId || '',
            rating: data.averageRating || prev.rating,
            reviews: data.reviewsCount || prev.reviews,
            students: data.studentsCount ? data.studentsCount.toLocaleString() : prev.students,
            price: `$${data.price}`,
            isEnrolled: data.isEnrolled,
            sections: data.sections || []
          }));
        }
      })
      .catch(err => {
        console.warn('Could not fetch latest course details from backend:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingDetails(false);
      });

    return () => { isMounted = false; };
  }, [selectedCourse]);

  // Determine current user permissions and strict author ownership
  const courseId = courseData.id || courseData.courseId;
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const authorEmail = (courseData.instructorEmail || '').toLowerCase().trim();
  const userFullName = (currentUser?.fullName || '').toLowerCase().trim();
  const authorName = (courseData.instructor || courseData.instructorName || '').toLowerCase().trim();
  const courseInstructorId = (courseData.instructorId || '').toString().toLowerCase().trim();
  const currentUserId = (currentUser?.id || '').toString().toLowerCase().trim();

  // An instructor is author IF AND ONLY IF they are the verified author of THIS specific course
  const isAuthor = Boolean(
    currentUser && (currentUser.role === 'Instructor' || currentUser.role === 'Admin') && (
      (courseInstructorId && currentUserId && courseInstructorId === currentUserId) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (!courseInstructorId && !authorEmail && authorName && userFullName && authorName === userFullName)
    )
  );

  const isAdmin = currentUser?.role === 'Admin';
  const isSubscribed = Boolean(currentUser?.isSubscribed);
  const isEnrolled = Boolean(courseData.isEnrolled || isAuthor || isAdmin || isSubscribed);

  // Transition to the interactive video classroom player
  const handleStartClassroom = (targetLesson = null) => {
    const courseObj = {
      courseId: courseId,
      id: courseId,
      title: courseData.title,
      instructorName: courseData.instructor || courseData.instructorName,
      targetLessonId: targetLesson?.id
    };

    if (onSelectCourseToPlay) {
      onSelectCourseToPlay(courseObj);
    }
    setActivePage('course-player', courseObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = () => {
    setActivePage('checkout', courseData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fallback curriculum when backend has no sections populated
  const fallbackCurriculum = [
    {
      module: 'Module 1: Introduction to Cloud Infrastructure and Virtual Classrooms',
      lessons: ['Course overview & setup', 'Designing scalable VPCs', 'Security groups & IAM roles']
    },
    {
      module: 'Module 2: Real-time Gradebook & Zoom Integration Pipelines',
      lessons: ['API handshakes with Zoom', 'Webhooks for attendance tracking', 'Storing quiz data in DynamoDB']
    },
    {
      module: 'Module 3: Serverless Microservices and Assessment Deployments',
      lessons: ['AWS Lambda triggers', 'API Gateway endpoints', 'Real-time student feedback loops']
    },
    {
      module: 'Module 4: Final Capstone Project & Certification Exam Preparation',
      lessons: ['Building a full e-learning portal', 'Live architectural review', 'Certification mock exam']
    }
  ];

  const hasRealSections = courseData.sections && courseData.sections.length > 0;

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-totc-gray mb-6">
          <button onClick={() => setActivePage('home')} className="hover:text-totc-teal">Home</button>
          <span>/</span>
          <button onClick={() => setActivePage('courses')} className="hover:text-totc-teal">Courses</button>
          <span>/</span>
          <span className="text-totc-navy font-medium truncate max-w-xs sm:max-w-md">{courseData.title}</span>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-gray-100 shadow-sm mb-12 relative overflow-hidden">
          {/* Role badge indicator on top right */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
              {courseData.category}
            </span>

            {isAuthor && (
              <span className="px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Instructor & Author Mode</span>
              </span>
            )}

            {isAdmin && !isAuthor && (
              <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Oversight Mode</span>
              </span>
            )}

            {isSubscribed && !isAuthor && !isAdmin && (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pro All-Access Active</span>
              </span>
            )}
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy leading-snug">
              {courseData.title}
            </h1>
            <p className="font-poppins text-totc-gray text-base sm:text-lg">
              {courseData.description || 'Master state-of-the-art interactive teaching, infrastructure scaling, and interactive virtual podium management with hands-on labs.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-totc-gray">
              {/* Clickable Instructor / Author Profile Trigger */}
              <button
                type="button"
                onClick={() => {
                  const instPayload = {
                    id: courseData.instructorId,
                    instructorId: courseData.instructorId,
                    fullName: courseData.instructor,
                    instructorName: courseData.instructor,
                    avatarUrl: courseData.instructorAvatar,
                    email: courseData.instructorEmail
                  };
                  setActivePage('instructor-profile', instPayload);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 group text-left transition-colors focus:outline-none"
                title="Click to view Instructor Bio, Education, Experience & Authored Courses"
              >
                <img
                  src={courseData.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={courseData.instructor}
                  className="w-8 h-8 rounded-full object-cover border border-totc-teal group-hover:scale-105 transition-transform shadow-sm"
                />
                <span className="font-medium text-totc-navy group-hover:text-totc-teal group-hover:underline">
                  Created by <span className="font-bold">{courseData.instructor}</span> {isAuthor && <span className="text-purple-600 font-bold">(You)</span>}
                </span>
              </button>

              <div className="flex items-center gap-1.5 text-totc-orange">
                <Star className="w-4 h-4 fill-totc-orange" />
                <span className="font-bold text-totc-navy">{courseData.rating}</span>
                <span>({courseData.reviews} ratings)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span>{courseData.students} enrolled students</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Details Left, Sticky Access Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Details Left (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Video Hero Preview */}
            <div
              onClick={() => isEnrolled ? handleStartClassroom() : openVideoModal()}
              className="relative rounded-[24px] overflow-hidden bg-slate-900 group cursor-pointer shadow-xl"
            >
              <img
                src="/assets/classroom_feature.png"
                alt="Course Video Preview"
                className="w-full h-[320px] sm:h-[420px] object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-totc-cyan fill-totc-cyan ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-6 text-white text-sm font-medium drop-shadow flex items-center gap-2">
                <span>{isEnrolled ? 'Click to enter interactive classroom player' : 'Click to preview course curriculum & lecture introduction'}</span>
                {isAuthor && (
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-[11px] font-bold text-white uppercase tracking-wider">
                    Author Access
                  </span>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-gray-200 gap-8">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-poppins text-lg capitalize transition-colors border-b-2 font-medium ${
                    activeTab === tab
                      ? 'border-totc-teal text-totc-teal font-semibold'
                      : 'border-transparent text-totc-gray hover:text-totc-navy'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 bg-white p-8 rounded-[24px] border border-gray-100">
                <h3 className="font-poppins font-bold text-2xl text-totc-navy">What you'll learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Design resilient online lecture architectures',
                    'Implement live video classrooms and podium spaces',
                    'Integrate automatic student attendance logging',
                    'Create interactive online tests and real-time grading',
                    'Manage private one-on-one video discussion breakout rooms',
                    'Export certified transcripts and performance rubrics'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-totc-mint shrink-0 mt-0.5" />
                      <span className="text-totc-gray text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Curriculum with Interactive Lesson Clicking */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4 bg-white p-8 rounded-[24px] border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-poppins font-bold text-2xl text-totc-navy">Course Curriculum</h3>
                    <p className="text-xs text-totc-gray mt-1">
                      {isEnrolled 
                        ? 'All lessons and quizzes are fully unlocked. Click any lecture to start playing.' 
                        : 'Explore course modules and preview lectures.'}
                    </p>
                  </div>

                  {isEnrolled && (
                    <button
                      onClick={() => handleStartClassroom()}
                      className="px-4 py-2 rounded-full bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start from Lecture 1</span>
                    </button>
                  )}
                </div>

                {hasRealSections ? (
                  courseData.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-totc-navy text-base">
                          {section.title}
                        </h4>
                        <span className="text-xs text-totc-gray font-medium">
                          {section.lessons?.length || 0} lectures
                        </span>
                      </div>

                      <div className="space-y-2">
                        {section.lessons?.map((lesson, lIdx) => {
                          const canPlay = isEnrolled || lesson.isFreePreview;
                          return (
                            <div
                              key={lesson.id || lIdx}
                              onClick={() => canPlay && handleStartClassroom(lesson)}
                              className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                                canPlay 
                                  ? 'bg-white hover:bg-teal-50/70 border border-gray-100 hover:border-totc-teal/40 cursor-pointer shadow-xs group' 
                                  : 'bg-white/50 border border-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  canPlay ? 'bg-teal-50 text-totc-teal group-hover:bg-totc-teal group-hover:text-white transition-colors' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${canPlay ? 'text-totc-navy group-hover:text-totc-teal transition-colors' : 'text-gray-400'}`}>
                                    {lesson.title}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px] text-totc-gray">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span>{lesson.durationMinutes || 15} mins</span>
                                    {lesson.isFreePreview && !isEnrolled && (
                                      <span className="text-totc-teal font-bold bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                                        Free Preview
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                {canPlay ? (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                                    <Unlock className="w-3 h-3 text-emerald-600" />
                                    <span>Play</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium inline-flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    <span>Locked</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  fallbackCurriculum.map((item, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                      <h4 className="font-semibold text-totc-navy text-base mb-2">{item.module}</h4>
                      <ul className="space-y-1.5 pl-4">
                        {item.lessons.map((lesson, lIdx) => (
                          <li key={lIdx} className="text-sm text-totc-gray flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Play className="w-3.5 h-3.5 text-totc-teal" />
                              <span>{lesson}</span>
                            </div>
                            {isEnrolled && (
                              <span className="text-xs text-totc-teal font-semibold">Unlocked</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Instructor */}
            {activeTab === 'instructor' && (
              <div className="bg-white p-8 rounded-[24px] border border-gray-100 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={courseData.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={courseData.instructor}
                      className="w-16 h-16 rounded-full object-cover border-2 border-totc-teal shadow"
                    />
                    <div>
                      <h3 className="font-poppins font-bold text-xl text-totc-navy">{courseData.instructor}</h3>
                      <p className="text-totc-gray text-sm">{courseData.instructorEmail || 'Verified TOTC Lecturer'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const instPayload = {
                        id: courseData.instructorId,
                        instructorId: courseData.instructorId,
                        fullName: courseData.instructor,
                        instructorName: courseData.instructor,
                        avatarUrl: courseData.instructorAvatar,
                        email: courseData.instructorEmail
                      };
                      setActivePage('instructor-profile', instPayload);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs transition-colors self-start sm:self-center flex items-center gap-2 shadow-sm"
                  >
                    <span>View Full Bio & Courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-totc-gray text-sm leading-relaxed">
                  {courseData.instructor} is an experienced industry educator specializing in hands-on, high-impact coursework. Visit the instructor profile to inspect academic degrees, career experience, and browse all video lectures authored by this instructor.
                </p>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white p-8 rounded-[24px] border border-gray-100 space-y-6">
                <h3 className="font-poppins font-bold text-2xl text-totc-navy">Student Feedback</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Gloria Rose', rating: 5, date: '2 weeks ago', text: 'This course made virtual teaching effortless. The tools and real-time workflows are revolutionary.' },
                    { name: 'Arthur Pendelton', rating: 5, date: '1 month ago', text: 'Highly recommended! Clear explanations, amazing production quality, and truly interactive curriculum.' }
                  ].map((r, i) => (
                    <div key={i} className="border-b border-gray-100 pb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-totc-navy text-sm">{r.name}</span>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <div className="flex text-totc-orange">
                        {[...Array(r.rating)].map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-totc-orange" />
                        ))}
                      </div>
                      <p className="text-totc-gray text-sm pt-1">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Access / Purchase Card Right (4 cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-xl space-y-6">
              
              {/* 1. INSTRUCTOR / AUTHOR MODE */}
              {isAuthor ? (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-900 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Instructor & Author Access</span>
                    </div>
                    <p className="text-xs text-purple-800 leading-relaxed font-medium">
                      You are the creator of this course. Full access to all lectures, videos, and teaching resources is permanently unlocked without enrollment or payment.
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartClassroom()}
                    className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-base sm:text-lg transition-all shadow-lg shadow-totc-teal/20 flex items-center justify-center gap-2 group active:scale-98"
                  >
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span>Open Classroom & Watch Lectures</span>
                  </button>

                  <button
                    onClick={() => setActivePage('edit-course', courseData)}
                    className="w-full py-3 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Edit3 className="w-4 h-4 text-purple-700" />
                    <span>Edit Course & Lectures</span>
                  </button>

                  <button
                    onClick={() => setActivePage('instructor-dashboard')}
                    className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-totc-navy font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Instructor Studio</span>
                  </button>
                </div>
              ) 
              /* 2. ADMIN OVERSIGHT MODE */
              : isAdmin ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Platform Administrator Access</span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Full system oversight granted. You can review all syllabus modules, play video streams, and test quizzes without restrictions.
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartClassroom()}
                    className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-base sm:text-lg transition-all shadow-lg shadow-totc-teal/20 flex items-center justify-center gap-2 group active:scale-98"
                  >
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span>Open Classroom Player</span>
                  </button>

                  <button
                    onClick={() => setActivePage('admin-dashboard')}
                    className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-totc-navy font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Admin Console</span>
                  </button>
                </div>
              )
              /* 3. PRO SUBSCRIBER OR ENROLLED STUDENT */
              : isEnrolled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isSubscribed ? 'Pro Membership Active' : 'Enrolled Course'}</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {isSubscribed 
                        ? `Included with your ${currentUser?.subscriptionPlan || 'Pro'} All-Access Membership. Enjoy unlimited lessons and verified certificates.` 
                        : 'You are enrolled in this course. Continue where you left off!'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartClassroom()}
                    className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-base sm:text-lg transition-all shadow-lg shadow-totc-teal/20 flex items-center justify-center gap-2 group active:scale-98"
                  >
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span>Continue Learning</span>
                  </button>
                </div>
              )
              /* 4. NON-ENROLLED GUEST / STUDENT */
              : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-poppins font-bold text-4xl text-totc-purple">
                        {courseData.price}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {courseData.oldPrice || '$600'}
                      </span>
                      <span className="text-xs font-bold text-totc-mint bg-totc-mint/10 px-2.5 py-1 rounded-full uppercase">
                        25% Off
                      </span>
                    </div>
                    <p className="text-xs text-red-500 font-medium">Limited time discount ends in 2 days</p>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-lg transition-colors shadow-lg shadow-totc-teal/20 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Course Value Props Checklist */}
              <div className="space-y-4 pt-4 border-t border-gray-100 text-sm text-totc-gray">
                <div className="font-semibold text-totc-navy">This course includes:</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-totc-teal" />
                    <span>32 hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-totc-teal" />
                    <span>14 downloadable lesson guides</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-totc-teal" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-totc-teal" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
