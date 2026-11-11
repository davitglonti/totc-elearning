import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, DollarSign, Star, Plus, Video, 
  CheckCircle, Trash2, Sparkles, Eye, EyeOff, Layers, 
  Clock, AlertCircle, RefreshCw, ArrowUpRight, Edit3
} from 'lucide-react';
import { api } from '../services/api';

export default function InstructorDashboardPage({ currentUser, setActivePage, setSelectedCourse, onEditCourse }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Load instructor's own courses and real metrics
  const loadInstructorData = async () => {
    setRefreshing(true);
    try {
      const data = await api.instructor.getMyCourses();
      setSummary(data);
    } catch (err) {
      console.warn('Failed to load instructor courses:', err);
      setActionMessage({ type: 'error', text: 'Failed to load your courses: ' + err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInstructorData();
  }, []);

  // Handle toggling publish state
  const handleTogglePublish = async (courseId, currentPublished) => {
    try {
      const res = await api.instructor.toggleCoursePublish(courseId);
      setActionMessage({ 
        type: 'success', 
        text: `Course status changed to ${res.isPublished ? 'Live (Published)' : 'Draft (Hidden)'}.` 
      });
      setSummary(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courses: prev.courses.map(c => c.id === courseId ? { ...c, isPublished: res.isPublished } : c)
        };
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Could not toggle course status: ' + err.message });
    }
  };

  // Handle deleting course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete course "${courseTitle}"? All associated lessons and enrollments will be deleted.`)) {
      return;
    }

    try {
      await api.instructor.deleteCourse(courseId);
      setActionMessage({ type: 'success', text: `Course "${courseTitle}" deleted successfully.` });
      loadInstructorData();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Could not delete course: ' + err.message });
    }
  };

  const courses = summary?.courses || [];

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Instructor Studio
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="font-poppins text-totc-gray text-sm sm:text-base">
              Welcome back, <span className="text-totc-navy font-bold">{currentUser?.fullName || 'Instructor'}</span>! Track your lectures, enrolled students, and manage curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadInstructorData}
              disabled={refreshing}
              className="px-4 py-3 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Direct navigation to Course Creation Studio page */}
            <button
              onClick={() => setActivePage('create-course')}
              className="px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-3 text-sm font-semibold">
              {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Instructor Metrics - REAL data belonging strictly to this instructor */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {/* My Courses */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">My Courses</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {summary ? summary.totalCourses : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-purple-600 font-medium">Published & Drafts</p>
            </div>
          </div>

          {/* Total Lectures Count */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Lectures</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {summary ? summary.totalLessons : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">Video & Quiz Units</p>
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Enrolled Students</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {summary ? summary.totalStudents : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-totc-teal font-medium">Joined Your Courses</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Course Revenue</p>
              <h3 className="font-poppins font-black text-2xl text-emerald-600">
                {summary ? `$${Number(summary.totalRevenue).toLocaleString()}` : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-totc-gray font-medium">Rating: ⭐ {summary?.averageRating || '5.0'}</p>
            </div>
          </div>
        </div>

        {/* Curriculum Management Table */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-poppins font-bold text-xl text-totc-navy">My Course Curriculum</h3>
              <p className="text-xs text-totc-gray">Manage your modules, video lectures, student counts, and publishing.</p>
            </div>
            <span className="text-xs font-bold text-totc-teal bg-teal-50 px-3 py-1.5 rounded-full">
              {courses.length} Courses Authored by You
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-totc-gray">
              <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-wider text-totc-navy border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Category & Level</th>
                  <th className="px-6 py-4">Lectures</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Course Title & Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnailUrl || '/assets/explore_row_1.png'}
                          alt={c.title}
                          className="w-12 h-9 rounded-lg object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-totc-navy truncate">{c.title}</p>
                          <p className="text-[10px] text-totc-gray truncate">{c.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Level */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-totc-teal-light text-totc-teal text-[10px] font-bold uppercase">
                        {c.categoryName}
                      </span>
                      <p className="text-[10px] text-totc-gray mt-1">{c.level}</p>
                    </td>

                    {/* Lectures Count */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-totc-navy flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{c.lessonsCount} Lectures</span>
                      </span>
                      <p className="text-[10px] text-totc-gray">{c.sectionsCount} Modules</p>
                    </td>

                    {/* Students Count */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-totc-teal bg-teal-50 px-2.5 py-1 rounded-full text-[11px]">
                        {c.studentsCount} Students
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-totc-navy text-sm">
                      ${Number(c.price).toFixed(2)}
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4 font-poppins font-black text-emerald-600 text-sm">
                      ${Number(c.revenue).toFixed(2)}
                    </td>

                    {/* Status with Admin Moderation Info */}
                    <td className="px-6 py-4">
                      {c.approvalStatus === 'PendingApproval' && (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Pending Review</span>
                          </span>
                          <p className="text-[10px] text-totc-gray">Waiting for Admin</p>
                        </div>
                      )}

                      {c.approvalStatus === 'Approved' && (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Approved & Live</span>
                          </span>
                        </div>
                      )}

                      {c.approvalStatus === 'Rejected' && (
                        <div className="space-y-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span>Changes Requested</span>
                          </span>
                          {c.rejectionReason && (
                            <p className="text-[10px] text-red-600 font-medium line-clamp-2 max-w-[150px]" title={c.rejectionReason}>
                              Feedback: {c.rejectionReason}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              if (onEditCourse) onEditCourse(c);
                              else setActivePage('edit-course', c);
                            }}
                            className="text-[10px] font-bold text-red-700 underline hover:text-red-900 block"
                          >
                            Edit & Resubmit →
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Course Curriculum & Lessons */}
                        <button
                          onClick={() => {
                            if (onEditCourse) onEditCourse(c);
                            else setActivePage('edit-course', c);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-xs font-bold text-indigo-600 transition-colors inline-flex items-center gap-1 shadow-2xs"
                          title="Edit Course Curriculum & Lectures"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            const courseObj = {
                              courseId: c.id,
                              id: c.id,
                              title: c.title,
                              instructorName: c.instructorName || currentUser?.fullName
                            };
                            setActivePage('course-player', courseObj);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-totc-teal hover:text-white text-xs font-bold text-totc-teal transition-colors inline-flex items-center gap-1 shadow-2xs"
                          title="Open Video Classroom Player directly"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Classroom</span>
                        </button>

                        <button
                          onClick={() => {
                            const courseObj = {
                              ...c,
                              instructorId: c.instructorId || currentUser?.id,
                              instructorEmail: c.instructorEmail || currentUser?.email,
                              instructor: c.instructorName || currentUser?.fullName
                            };
                            if (setSelectedCourse) setSelectedCourse(courseObj);
                            setActivePage('course-detail', courseObj);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-totc-teal hover:text-white text-xs font-bold text-totc-navy transition-colors"
                          title="View Course Syllabus & Details"
                        >
                          Preview
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {courses.length === 0 && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-poppins font-bold text-totc-navy text-base">You haven't authored any courses yet</h4>
                <p className="text-xs text-totc-gray max-w-sm mx-auto">
                  Get started by defining your curriculum, uploading lecture videos, and teaching students globally.
                </p>
                <button
                  onClick={() => setActivePage('create-course')}
                  className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Course</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
