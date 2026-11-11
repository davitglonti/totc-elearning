import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Video, FileText, CheckCircle, 
  HelpCircle, Clock, Sparkles, BookOpen, Layers, DollarSign, 
  Image as ImageIcon, Globe, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const PRESET_THUMBNAILS = [
  { label: 'Cloud & DevOps', url: '/assets/explore_row_1.png' },
  { label: 'UI/UX Design', url: '/assets/explore_row_2.png' },
  { label: 'Photography & Media', url: '/assets/explore_row_3.png' },
  { label: 'Programming', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
  { label: 'Business & Tech', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80' },
];

export default function CreateCoursePage({ currentUser, setActivePage, setSelectedCourse }) {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Course Essentials
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState('99');
  const [thumbnailUrl, setThumbnailUrl] = useState('/assets/explore_row_1.png');
  const [isPublished, setIsPublished] = useState(true);

  // Curriculum Builder (Modules & Lectures)
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'Module 1: Getting Started & Core Fundamentals',
      orderIndex: 1,
      lessons: [
        {
          id: 'les-1',
          title: 'Course Introduction & Environment Setup',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          durationMinutes: 12,
          contentText: 'Welcome to the curriculum. In this lecture, we configure our development toolchain and review core concepts.',
          isFreePreview: true,
          lessonType: 'Video',
          orderIndex: 1,
        },
        {
          id: 'les-2',
          title: 'Architectural Blueprint & Data Flow',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          durationMinutes: 20,
          contentText: 'Deep dive into systemic architecture, resilient state patterns, and best practices.',
          isFreePreview: false,
          lessonType: 'Video',
          orderIndex: 2,
        }
      ]
    }
  ]);

  // Load real categories from API
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.courses.getCategories();
        setCategories(cats || []);
        if (cats && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Section Management
  const handleAddSection = () => {
    const newSecNum = sections.length + 1;
    setSections([
      ...sections,
      {
        id: `sec-${Date.now()}`,
        title: `Module ${newSecNum}: Advanced Applications`,
        orderIndex: newSecNum,
        lessons: [
          {
            id: `les-${Date.now()}`,
            title: `Lesson 1: Core Implementation`,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            durationMinutes: 15,
            contentText: 'Practical walkthrough and exercise.',
            isFreePreview: false,
            lessonType: 'Video',
            orderIndex: 1,
          }
        ]
      }
    ]);
  };

  const handleRemoveSection = (secIndex) => {
    if (sections.length <= 1) {
      alert('A course must contain at least one module/section.');
      return;
    }
    setSections(sections.filter((_, idx) => idx !== secIndex));
  };

  const handleSectionTitleChange = (secIndex, val) => {
    const updated = [...sections];
    updated[secIndex].title = val;
    setSections(updated);
  };

  // Lesson Management within Section
  const handleAddLesson = (secIndex) => {
    const updated = [...sections];
    const newLesNum = updated[secIndex].lessons.length + 1;
    updated[secIndex].lessons.push({
      id: `les-${Date.now()}`,
      title: `Lesson ${newLesNum}: Hands-on Workshop`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationMinutes: 15,
      contentText: 'Key concepts, code examples, and step-by-step guidance.',
      isFreePreview: false,
      lessonType: 'Video',
      orderIndex: newLesNum,
    });
    setSections(updated);
  };

  const handleRemoveLesson = (secIndex, lesIndex) => {
    const updated = [...sections];
    if (updated[secIndex].lessons.length <= 1) {
      alert('A module must have at least one lesson.');
      return;
    }
    updated[secIndex].lessons = updated[secIndex].lessons.filter((_, idx) => idx !== lesIndex);
    setSections(updated);
  };

  const handleLessonChange = (secIndex, lesIndex, field, value) => {
    const updated = [...sections];
    updated[secIndex].lessons[lesIndex][field] = value;
    setSections(updated);
  };

  // Submit Course to Backend
  const handleSubmitCourse = async (publishImmediately) => {
    if (!title.trim()) {
      setErrorMessage('Please enter a course title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || 'Comprehensive hands-on curriculum created in Instructor Studio.',
        price: parseFloat(price) || 0,
        level: level,
        categoryId: categoryId || (categories[0]?.id),
        thumbnailUrl: thumbnailUrl.trim() || '/assets/explore_row_1.png',
        isPublished: publishImmediately,
        sections: sections.map((s, sIdx) => ({
          title: s.title.trim(),
          orderIndex: sIdx + 1,
          lessons: s.lessons.map((l, lIdx) => ({
            title: l.title.trim(),
            videoUrl: l.videoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            durationMinutes: parseInt(l.durationMinutes, 10) || 15,
            contentText: l.contentText?.trim() || '',
            isFreePreview: !!l.isFreePreview,
            lessonType: l.lessonType || 'Video',
            orderIndex: lIdx + 1,
          }))
        }))
      };

      const result = await api.instructor.createFullCourse(payload);
      setSuccessMessage('🎉 Course successfully created and published to TOTC LMS catalog!');

      // Redirect back to Instructor Studio after 1.5 seconds
      setTimeout(() => {
        setActivePage('instructor-dashboard');
      }, 1500);

    } catch (err) {
      console.error('Failed to create course:', err);
      setErrorMessage(err.message || 'Failed to create course. Please review the form fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalLecturesCount = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalDurationMinutes = sections.reduce(
    (acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + (parseInt(l.durationMinutes, 10) || 0), 0), 
    0
  );

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Top Navigation Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setActivePage('instructor-dashboard')}
            className="inline-flex items-center gap-2 text-sm font-bold text-totc-gray hover:text-totc-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Instructor Studio</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmitCourse(false)}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              onClick={() => handleSubmitCourse(true)}
              disabled={submitting}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Publishing Course...' : 'Save & Publish Course'}</span>
            </button>
          </div>
        </div>

        {/* Page Banner Title */}
        <div className="mb-8 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Course Curriculum Studio
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              Create New Course
            </h1>
            <p className="font-poppins text-totc-gray text-sm">
              Define course parameters, structure learning modules, and attach lecture videos.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <p className="text-totc-gray font-semibold">Modules</p>
              <p className="font-black text-lg text-totc-navy">{sections.length}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-totc-gray font-semibold">Total Lectures</p>
              <p className="font-black text-lg text-totc-teal">{totalLecturesCount}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-totc-gray font-semibold">Total Runtime</p>
              <p className="font-black text-lg text-indigo-700">{Math.round(totalDurationMinutes / 60 * 10) / 10} hrs</p>
            </div>
          </div>
        </div>

        {/* Success or Error Banners */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section 1: Course Essentials */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-totc-teal-light text-totc-teal font-black text-xs flex items-center justify-center">1</span>
              <span>Course Essentials & Overview</span>
            </h2>
            <p className="text-xs text-totc-gray mt-1">
              Provide basic course information, pricing, level, and cover image.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Course Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Full-Stack Cloud Architecture & React Engineering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Course Description & Learning Outcomes
              </label>
              <textarea
                rows={3}
                placeholder="Describe what students will master, prerequisites, and project deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal focus:ring-1 focus:ring-totc-teal"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Subject Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal bg-white cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                {categories.length === 0 && (
                  <>
                    <option value="a060b466-5aba-4c96-8d0f-953d409f5cfe">Design & UX</option>
                    <option value="b060b466-5aba-4c96-8d0f-953d409f5cfe">Development & Cloud</option>
                    <option value="c060b466-5aba-4c96-8d0f-953d409f5cfe">Business & Management</option>
                  </>
                )}
              </select>
            </div>

            {/* Course Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal bg-white cursor-pointer"
              >
                <option value="Beginner">Beginner (Introductory)</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced (Expert)</option>
              </select>
            </div>

            {/* Price ($ USD) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Course Price ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-totc-gray absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>
            </div>

            {/* Thumbnail URL & Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                Thumbnail Image URL
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-totc-gray absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-totc-navy focus:outline-none focus:border-totc-teal"
                />
              </div>
            </div>

            {/* Thumbnail Quick Presets */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-[11px] font-bold text-totc-gray">Or pick a curated thumbnail preset:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_THUMBNAILS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setThumbnailUrl(p.url)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      thumbnailUrl === p.url
                        ? 'bg-totc-teal text-white border-totc-teal'
                        : 'bg-gray-50 text-totc-gray hover:text-totc-navy border-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Curriculum Builder (Modules & Lectures) */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm mb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-totc-teal-light text-totc-teal font-black text-xs flex items-center justify-center">2</span>
                <span>Curriculum Builder (Modules & Lectures)</span>
              </h2>
              <p className="text-xs text-totc-gray mt-1">
                Organize your course into structured sections and attach interactive lecture videos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="px-4 py-2.5 rounded-full font-bold text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-2 shrink-0 border border-purple-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Module</span>
            </button>
          </div>

          {/* List of Modules */}
          <div className="space-y-6">
            {sections.map((section, secIdx) => (
              <div 
                key={section.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-gray-200/80 space-y-4"
              >
                {/* Module Header Bar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-totc-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                      M{secIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(secIdx, e.target.value)}
                      placeholder="Module Title..."
                      className="w-full bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-totc-navy focus:outline-none focus:border-totc-teal"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLesson(secIdx)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-totc-teal text-white hover:bg-totc-teal-dark transition-colors flex items-center gap-1.5"
                      title="Add lecture to this module"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lecture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSection(secIdx)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Module Lessons List */}
                <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-totc-teal/30">
                  {section.lessons.map((lesson, lesIdx) => (
                    <div 
                      key={lesson.id}
                      className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm space-y-3"
                    >
                      {/* Lesson Row 1: Title, Type, Duration & Delete */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-6 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-totc-gray w-5">{lesIdx + 1}.</span>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(secIdx, lesIdx, 'title', e.target.value)}
                            placeholder="Lecture Title..."
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-totc-navy focus:outline-none focus:border-totc-teal"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <select
                            value={lesson.lessonType}
                            onChange={(e) => handleLessonChange(secIdx, lesIdx, 'lessonType', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-totc-navy bg-white focus:outline-none"
                          >
                            <option value="Video">🎥 Video Lecture</option>
                            <option value="Quiz">❓ Interactive Quiz</option>
                            <option value="Assignment">📝 Hands-on Lab</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-totc-gray shrink-0" />
                          <input
                            type="number"
                            min="1"
                            value={lesson.durationMinutes}
                            onChange={(e) => handleLessonChange(secIdx, lesIdx, 'durationMinutes', e.target.value)}
                            placeholder="Mins"
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-navy text-center"
                          />
                          <span className="text-[11px] text-totc-gray">min</span>
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(secIdx, lesIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lesson Row 2: Video URL & Free Preview Toggle */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-8 flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-totc-teal shrink-0 ml-7" />
                          <input
                            type="text"
                            value={lesson.videoUrl}
                            onChange={(e) => handleLessonChange(secIdx, lesIdx, 'videoUrl', e.target.value)}
                            placeholder="Video Stream URL (MP4, CDN, YouTube, Vimeo)..."
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-totc-gray focus:outline-none focus:border-totc-teal font-mono"
                          />
                        </div>

                        <div className="sm:col-span-4 flex items-center justify-end">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-totc-navy">
                            <input
                              type="checkbox"
                              checked={lesson.isFreePreview}
                              onChange={(e) => handleLessonChange(secIdx, lesIdx, 'isFreePreview', e.target.checked)}
                              className="rounded text-totc-teal focus:ring-totc-teal"
                            />
                            <span>Free Preview Lecture</span>
                          </label>
                        </div>
                      </div>

                      {/* Lesson Row 3: Notes / Summary */}
                      <div className="pl-7">
                        <input
                          type="text"
                          value={lesson.contentText}
                          onChange={(e) => handleLessonChange(secIdx, lesIdx, 'contentText', e.target.value)}
                          placeholder="Lecture notes or summary for students (optional)..."
                          className="w-full px-3 py-1 rounded-lg border border-gray-100 text-[11px] text-totc-gray focus:outline-none focus:border-totc-teal"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="bg-totc-navy text-white p-6 sm:p-8 rounded-[28px] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-poppins font-black text-xl">Ready to Launch Your Course?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your course will be immediately verified and accessible across the TOTC classroom and catalog.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActivePage('instructor-dashboard')}
              className="px-6 py-3 rounded-full font-bold text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => handleSubmitCourse(true)}
              disabled={submitting}
              className="px-8 py-3.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Publishing Course...' : 'Publish Course to Catalog'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
