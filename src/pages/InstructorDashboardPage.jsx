import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, DollarSign, Star, Plus, Video, 
  Upload, CheckCircle, Edit, Trash2, Sparkles, ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';

export default function InstructorDashboardPage({ currentUser, setActivePage, setSelectedCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Course creation form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '99',
    level: 'Beginner',
    categoryId: 'a060b466-5aba-4c96-8d0f-953d409f5cfe', // Design category default
  });

  useEffect(() => {
    async function loadInstructorCourses() {
      setLoading(true);
      try {
        const res = await api.courses.getAll({ pageSize: 50 });
        setCourses(res.items || []);
      } catch (e) {
        console.warn('Failed to load instructor courses:', e.message);
      } finally {
        setLoading(false);
      }
    }
    loadInstructorCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      // Post to backend instructor endpoint
      const token = api.auth.getToken();
      const res = await fetch('http://localhost:5000/api/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 99,
          level: formData.level,
          categoryId: formData.categoryId
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Course creation failed');
      }

      const newCourse = await res.json();
      setSuccessMsg('Course successfully created and published!');
      setShowCreateModal(false);
      setCourses(prev => [newCourse, ...prev]);
      setFormData({ title: '', description: '', price: '99', level: 'Beginner', categoryId: formData.categoryId });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Instructor Studio
            </div>
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy">
              Instructor Dashboard
            </h1>
            <p className="font-poppins text-totc-gray text-base">
              Welcome, {currentUser?.fullName || 'Instructor'}! Manage your courses, track enrollments, and launch new lectures.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {successMsg && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 4 Instructor Metrics - Dynamically calculated from real courses */}
        {(() => {
          const totalStudents = courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
          const totalRevenue = courses.reduce((acc, c) => acc + ((c.studentsCount || 0) * (c.price || 0)), 0);
          const avgRating = courses.length > 0 
            ? (courses.reduce((acc, c) => acc + (c.averageRating || 5), 0) / courses.length).toFixed(1)
            : '5.0';

          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
              <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">My Courses</p>
                  <h3 className="font-poppins font-bold text-2xl text-totc-navy">{courses.length}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Students</p>
                  <h3 className="font-poppins font-bold text-2xl text-totc-navy">{totalStudents}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Revenue</p>
                  <h3 className="font-poppins font-bold text-2xl text-emerald-600">
                    ${Number(totalRevenue).toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Avg. Rating</p>
                  <h3 className="font-poppins font-bold text-2xl text-totc-navy">{avgRating} / 5.0</h3>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Courses Table */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-poppins font-bold text-xl text-totc-navy">Curriculum Management</h3>
            <span className="text-xs text-totc-gray font-medium">{courses.length} courses listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-totc-gray">
              <thead className="bg-gray-50/80 text-xs font-semibold uppercase text-totc-navy">
                <tr>
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-totc-navy max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-totc-teal-light text-totc-teal text-xs font-medium">
                        {c.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{c.level}</td>
                    <td className="px-6 py-4 font-bold text-totc-navy">${c.price}</td>
                    <td className="px-6 py-4 text-xs">⭐ {c.averageRating || 5.0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          if (setSelectedCourse) setSelectedCourse(c);
                          setActivePage('course-detail');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-totc-teal hover:text-white text-xs font-semibold text-totc-navy transition-colors"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-8 shadow-2xl border border-gray-100">
            <h3 className="font-poppins font-bold text-2xl text-totc-navy mb-2">Create New Course</h3>
            <p className="text-xs text-totc-gray mb-6">Launch a new course onto the TOTC marketplace.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-totc-navy uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React 19 and Next.js"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-totc-navy uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Brief summary of skills taught..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-totc-navy uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-totc-navy uppercase mb-1">Skill Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-totc-gray hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-totc-teal text-white hover:bg-totc-teal-dark shadow-md"
                >
                  {submitting ? 'Creating...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}