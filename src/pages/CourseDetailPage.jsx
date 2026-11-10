import React, { useState } from 'react';
import { Star, Play, CheckCircle, Clock, BookOpen, Award, ShieldCheck, ArrowRight, User } from 'lucide-react';

export default function CourseDetailPage({ selectedCourse, setActivePage, openVideoModal, currentUser, onSelectCourseToPlay }) {
  const [activeTab, setActiveTab] = useState('overview');

  const course = selectedCourse || {
    id: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    courseId: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    title: 'AWS Certified Solutions Architect & Cloud Operations',
    category: 'Cloud Architecture & DevOps',
    instructor: 'Lina Wilson',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 1420,
    hours: '32 hrs',
    students: '12,500',
    price: '$450',
    oldPrice: '$600',
    image: '/assets/explore_row_1.png'
  };

  const handleStartProCourse = () => {
    const courseObj = {
      courseId: course.id || course.courseId,
      title: course.title,
      instructorName: course.instructor
    };
    if (onSelectCourseToPlay) {
      onSelectCourseToPlay(courseObj);
    }
    setActivePage('course-player', courseObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const curriculum = [
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

  const handleBuyNow = () => {
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-totc-gray mb-6">
          <button onClick={() => setActivePage('home')} className="hover:text-totc-teal">Home</button>
          <span>/</span>
          <button onClick={() => setActivePage('courses')} className="hover:text-totc-teal">Courses</button>
          <span>/</span>
          <span className="text-totc-navy font-medium truncate max-w-xs sm:max-w-md">{course.title}</span>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-gray-100 shadow-sm mb-12">
          <div className="max-w-4xl space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
              {course.category}
            </span>
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy leading-snug">
              {course.title}
            </h1>
            <p className="font-poppins text-totc-gray text-base sm:text-lg">
              Master state-of-the-art interactive teaching, infrastructure scaling, and interactive virtual podium management with hands-on labs.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-totc-gray">
              <div className="flex items-center gap-2">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructor}
                  className="w-8 h-8 rounded-full object-cover border border-totc-teal"
                />
                <span className="font-medium text-totc-navy">Created by {course.instructor}</span>
              </div>

              <div className="flex items-center gap-1.5 text-totc-orange">
                <Star className="w-4 h-4 fill-totc-orange" />
                <span className="font-bold text-totc-navy">{course.rating}</span>
                <span>({course.reviews} ratings)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span>{course.students} enrolled students</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Layout: Details Left, Sticky Card Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Details Left (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Video Hero Preview */}
            <div
              onClick={openVideoModal}
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
              <div className="absolute bottom-4 left-6 text-white text-sm font-medium drop-shadow">
                Click to preview course curriculum & lecture introduction
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

            {/* Tab: Curriculum */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4 bg-white p-8 rounded-[24px] border border-gray-100">
                <h3 className="font-poppins font-bold text-2xl text-totc-navy mb-4">Course Curriculum</h3>
                {curriculum.map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                    <h4 className="font-semibold text-totc-navy text-base mb-2">{item.module}</h4>
                    <ul className="space-y-1.5 pl-4">
                      {item.lessons.map((lesson, lIdx) => (
                        <li key={lIdx} className="text-sm text-totc-gray flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-totc-teal" />
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Instructor */}
            {activeTab === 'instructor' && (
              <div className="bg-white p-8 rounded-[24px] border border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-16 h-16 rounded-full object-cover border-2 border-totc-teal"
                  />
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-totc-navy">{course.instructor}</h3>
                    <p className="text-totc-gray text-sm">Principal EdTech Consultant & Systems Architect</p>
                  </div>
                </div>
                <p className="text-totc-gray text-sm leading-relaxed">
                  Lina has over 12 years of experience leading educational technology design at Ivy League universities and global edtech corporations. She has personally mentored more than 40,000 students worldwide.
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

          {/* Sticky Purchase Card Right (4 cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-xl space-y-6">
              {currentUser?.isSubscribed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Included with your {currentUser.subscriptionPlan || 'Pro'} All-Access Membership</span>
                  </div>

                  <button
                    onClick={handleStartProCourse}
                    className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-lg transition-all shadow-lg shadow-totc-teal/20 flex items-center justify-center gap-2 group"
                  >
                    <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                    <span>Start Learning (Pro Access)</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-poppins font-bold text-4xl text-totc-purple">
                        {course.price}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {course.oldPrice}
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
