import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Video, FileText, CheckCircle, 
  HelpCircle, Clock, Sparkles, BookOpen, Layers, DollarSign, 
  Image as ImageIcon, Globe, Eye, EyeOff, Save, AlertCircle, RefreshCw,
  UploadCloud, Check, Loader2, Play
} from 'lucide-react';
import { api } from '../services/api';

const PRESET_THUMBNAILS = [
  { label: 'Cloud & DevOps', url: '/assets/explore_row_1.png' },
  { label: 'UI/UX Design', url: '/assets/explore_row_2.png' },
  { label: 'Photography & Media', url: '/assets/explore_row_3.png' },
  { label: 'Programming', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
  { label: 'Business & Tech', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80' },
];

export default function CreateCoursePage({ currentUser, courseToEdit, setActivePage, setSelectedCourse }) {
  const isEditing = Boolean(courseToEdit);
  const targetCourseId = courseToEdit?.id || courseToEdit?.courseId;

  const [categories, setCategories] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Course Essentials
  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [description, setDescription] = useState(courseToEdit?.description || '');
  const [categoryId, setCategoryId] = useState(courseToEdit?.categoryId || '');
  const [level, setLevel] = useState(courseToEdit?.level || 'Beginner');
  const [price, setPrice] = useState(courseToEdit?.price ? String(courseToEdit.price).replace('$', '') : '99');
  const [thumbnailUrl, setThumbnailUrl] = useState(courseToEdit?.thumbnailUrl || '/assets/explore_row_1.png');
  const [isPublished, setIsPublished] = useState(courseToEdit?.isPublished ?? true);
  const [approvalStatus, setApprovalStatus] = useState(courseToEdit?.approvalStatus || 'Approved');
  const [rejectionReason, setRejectionReason] = useState(courseToEdit?.rejectionReason || null);

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
        if (cats && cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // If in Edit Mode, fetch the full existing course structure from backend
  useEffect(() => {
    if (!targetCourseId) return;

    let isMounted = true;
    setLoadingCourse(true);

    api.instructor.getCourseForEdit(targetCourseId)
      .then(data => {
        if (!isMounted || !data) return;
        setTitle(data.title || '');
        setDescription(data.description || '');
        if (data.categoryId) setCategoryId(data.categoryId);
        if (data.level) setLevel(data.level);
        if (data.price !== undefined) setPrice(String(data.price));
        if (data.thumbnailUrl) setThumbnailUrl(data.thumbnailUrl);
        setIsPublished(data.isPublished);
        setApprovalStatus(data.approvalStatus || 'Approved');
        setRejectionReason(data.rejectionReason || null);

        if (data.sections && data.sections.length > 0) {
          setSections(data.sections.map(s => ({
            id: s.id,
            title: s.title,
            orderIndex: s.orderIndex,
            lessons: (s.lessons || []).map(l => ({
              id: l.id,
              title: l.title,
              videoUrl: l.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              durationMinutes: l.durationMinutes || 15,
              contentText: l.contentText || '',
              isFreePreview: !!l.isFreePreview,
              lessonType: l.lessonType || 'Video',
              orderIndex: l.orderIndex
            }))
          })));
        }
      })
      .catch(err => {
        console.warn('Could not load full course for editing:', err.message);
        setErrorMessage('Failed to load full course details: ' + err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingCourse(false);
      });

    return () => { isMounted = false; };
  }, [targetCourseId]);

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
            contentText: 'Practical walkthrough, demonstration, and hands-on code exercises.',
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
      contentText: 'Key concepts, lecture video guidance, and step-by-step exercises.',
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

  // Direct Video Upload to Bunny Stream CDN with Live Progress
  const [uploadingKey, setUploadingKey] = useState(null); // e.g. "sIdx-lIdx"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadNotice, setUploadNotice] = useState(null); // { key, message, isSuccess }

  const handleVideoUpload = async (sIdx, lIdx, file, lessonTitle) => {
    if (!file) return;
    const itemKey = `${sIdx}-${lIdx}`;
    setUploadingKey(itemKey);
    setUploadProgress(0);
    setUploadNotice(null);

    // Try extracting duration from local file metadata
    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        window.URL.revokeObjectURL(tempVideo.src);
        if (tempVideo.duration && !isNaN(tempVideo.duration)) {
          const mins = Math.max(1, Math.round(tempVideo.duration / 60));
          handleLessonChange(sIdx, lIdx, 'durationMinutes', mins);
        }
      };
      tempVideo.src = URL.createObjectURL(file);
    } catch (e) {
      console.warn('Could not read video duration metadata:', e);
    }

    try {
      const res = await api.instructor.uploadVideo(
        file,
        lessonTitle || `Lecture ${sIdx + 1}.${lIdx + 1}`,
        (percent) => {
          setUploadProgress(percent);
        }
      );

      // Preferred video URL: embedUrl (Bunny iframe) or directPlayUrl
      const finalUrl = res.embedUrl || res.directPlayUrl || res.hlsUrl;
      if (finalUrl) {
        handleLessonChange(sIdx, lIdx, 'videoUrl', finalUrl);
      }

      setUploadNotice({
        key: itemKey,
        isSuccess: true,
        message: res.isBunnyStream 
          ? `✓ Transcoded & hosted on Bunny Stream CDN (Library: ${res.libraryId || '805955'})`
          : `✓ Video saved to server CDN storage: ${res.fileName}`
      });
    } catch (err) {
      console.error('Video upload error:', err);
      setUploadNotice({
        key: itemKey,
        isSuccess: false,
        message: 'Upload failed: ' + (err.message || 'Network error')
      });
    } finally {
      setUploadingKey(null);
    }
  };

  // Submit Course to Backend (Create or Update)
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
        categoryId: categoryId || (categories[0]?.id) || '10000000-0000-0000-0000-000000000001',
        thumbnailUrl: thumbnailUrl.trim() || '/assets/explore_row_1.png',
        isPublished: publishImmediately,
        resubmitForReview: true,
        sections: sections.map((s, sIdx) => ({
          id: s.id && !String(s.id).startsWith('sec-') ? s.id : null,
          title: s.title.trim(),
          orderIndex: sIdx + 1,
          lessons: s.lessons.map((l, lIdx) => ({
            id: l.id && !String(l.id).startsWith('les-') ? l.id : null,
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

      if (isEditing && targetCourseId) {
        // UPDATE EXISTING COURSE
        await api.instructor.updateFullCourse(targetCourseId, payload);
        if (currentUser?.role === 'Admin') {
          setSuccessMessage('🎉 Course curriculum and lectures updated successfully!');
        } else {
          setSuccessMessage('🎉 Course curriculum updated and resubmitted for admin review!');
        }
      } else {
        // CREATE BRAND NEW COURSE
        await api.instructor.createFullCourse(payload);
        if (currentUser?.role === 'Admin') {
          setSuccessMessage('🎉 Course successfully published to TOTC LMS catalog!');
        } else {
          setSuccessMessage('🎉 Course submitted for review! An Administrator will audit your curriculum and publish it upon verification.');
        }
      }

      // Redirect back to Instructor Studio after 1.5 seconds
      setTimeout(() => {
        setActivePage('instructor-dashboard');
      }, 1500);

    } catch (err) {
      console.error('Failed to save course:', err);
      setErrorMessage(err.message || 'Failed to save course. Please review the form fields.');
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
              disabled={submitting || loadingCourse}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              onClick={() => handleSubmitCourse(true)}
              disabled={submitting || loadingCourse}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {submitting 
                  ? 'Saving Course...' 
                  : isEditing 
                    ? (currentUser?.role === 'Admin' ? 'Save & Update Course' : 'Save & Resubmit for Approval') 
                    : (currentUser?.role === 'Admin' ? 'Save & Publish Course' : 'Submit for Review')}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Spinner in Edit Mode */}
        {loadingCourse && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-3 text-totc-teal font-bold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading full course curriculum and video lectures...</span>
          </div>
        )}

        {/* Admin Feedback Rejection Banner (If Changes Requested) */}
        {isEditing && approvalStatus === 'Rejected' && rejectionReason && (
          <div className="mb-8 p-6 rounded-[24px] bg-red-50 border-2 border-red-200 text-red-900 space-y-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 font-bold text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="uppercase tracking-wider">Administrator Feedback — Changes Requested</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-red-100 text-sm font-semibold text-red-900 leading-relaxed">
              "{rejectionReason}"
            </div>
            <p className="text-xs text-red-700 font-medium">
              Please address the administrator's review feedback below (add or delete lectures, update video links, or refine descriptions), then click <strong>"Save & Resubmit for Approval"</strong>.
            </p>
          </div>
        )}

        {/* Page Banner Title */}
        <div className="mb-8 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Course Curriculum Editor' : 'Course Curriculum Studio'}</span>
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              {isEditing ? `Edit: ${title || 'Course'}` : 'Create New Course'}
            </h1>
            <p className="font-poppins text-totc-gray text-sm">
              {isEditing 
                ? 'Update course metadata, manage modules, add or delete lecture videos, and resubmit for approval.' 
                : 'Define course parameters, structure learning modules, and attach lecture videos.'}
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

        {/* Alert Feedback Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-semibold animate-bounce">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Course Meta & Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Basic Info Card */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                <FileText className="w-4 h-4 text-totc-teal" />
                <span>Course Essentials</span>
              </h3>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Cloud Mastery & DevOps"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  Overview / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a concise summary of what students will master..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  Discipline / Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm font-medium transition-all bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">General Development</option>
                  )}
                </select>
              </div>

              {/* Level & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                    Target Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-medium transition-all bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="AllLevels">All Levels</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                    Price ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-bold text-totc-navy transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Selection */}
            <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-totc-teal" />
                <span>Course Artwork</span>
              </h3>

              {/* Current Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 shadow-inner">
                <img
                  src={thumbnailUrl || '/assets/explore_row_1.png'}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">
                  Select Preset Image
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_THUMBNAILS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setThumbnailUrl(p.url)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate border transition-all ${
                        thumbnailUrl === p.url
                          ? 'border-totc-teal bg-totc-teal-light text-totc-teal font-bold'
                          : 'border-gray-200 hover:border-gray-300 text-totc-navy'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">
                  Or Custom Image URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs text-totc-navy transition-all"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Curriculum Builder (Modules & Lectures) (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>Curriculum & Video Lectures</span>
                  </h3>
                  <p className="text-xs text-totc-gray mt-0.5">
                    Build multi-module structure, attach video stream URLs, and set free preview previews.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-6">
                {sections.map((section, sIdx) => (
                  <div
                    key={section.id || sIdx}
                    className="p-5 sm:p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 space-y-4 shadow-2xs"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                          placeholder={`Module ${sIdx + 1} Title`}
                          className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 focus:border-indigo-600 outline-none text-sm font-bold text-totc-navy transition-all"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sIdx)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lessons inside Section */}
                    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-200/60">
                      {section.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id || lIdx}
                          className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-[11px] font-bold text-totc-gray">
                                {sIdx + 1}.{lIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(sIdx, lIdx, 'title', e.target.value)}
                                placeholder="Lecture Title"
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-xs font-semibold text-totc-navy"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLesson(sIdx, lIdx)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                              title="Delete lesson"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Video Upload & Stream Settings */}
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="text-[11px] font-bold text-totc-navy flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-totc-teal" />
                                <span>Lecture Video Source</span>
                              </label>

                              {/* Direct Bunny Upload Button */}
                              <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
                                uploadingKey === `${sIdx}-${lIdx}`
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 pointer-events-none'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}>
                                {uploadingKey === `${sIdx}-${lIdx}` ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                    <span>Uploading ({uploadProgress}%)...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Upload Video File (Bunny CDN)</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="video/*"
                                  disabled={uploadingKey === `${sIdx}-${lIdx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleVideoUpload(sIdx, lIdx, e.target.files[0], lesson.title);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Active Upload Progress Bar */}
                            {uploadingKey === `${sIdx}-${lIdx}` && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                                  <span className="flex items-center gap-1.5">
                                    <UploadCloud className="w-4 h-4 animate-bounce text-amber-600" />
                                    Uploading binary stream to Bunny CDN pipeline...
                                  </span>
                                  <span className="font-mono">{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-200 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Upload Notice */}
                            {uploadNotice?.key === `${sIdx}-${lIdx}` && (
                              <div className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-between gap-2 ${
                                uploadNotice.isSuccess 
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                                  : 'bg-red-50 border border-red-200 text-red-800'
                              }`}>
                                <span>{uploadNotice.message}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setUploadNotice(null)} 
                                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            )}

                            {/* Bunny Stream CDN Ready Badge */}
                            {lesson.videoUrl && (lesson.videoUrl.includes('mediadelivery.net') || lesson.videoUrl.includes('b-cdn.net')) && (
                              <div className="px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg flex items-center justify-between text-[11px]">
                                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                  ⚡ Bunny Stream CDN Transcoded & Ready
                                </span>
                                <a 
                                  href={lesson.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-teal-700 hover:text-teal-900 font-semibold underline text-[10px]"
                                >
                                  Preview Stream
                                </a>
                              </div>
                            )}

                            {/* Video URL & Runtime Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                              <div className="sm:col-span-8 relative">
                                <Video className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="url"
                                  value={lesson.videoUrl}
                                  onChange={(e) => handleLessonChange(sIdx, lIdx, 'videoUrl', e.target.value)}
                                  placeholder="Video Stream URL or Bunny Embed URL"
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-[11px] font-mono text-totc-navy"
                                />
                              </div>

                              <div className="sm:col-span-4 flex items-center gap-2">
                                <div className="relative flex-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="number"
                                    min="1"
                                    value={lesson.durationMinutes}
                                    onChange={(e) => handleLessonChange(sIdx, lIdx, 'durationMinutes', e.target.value)}
                                    placeholder="Minutes"
                                    className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-[11px] font-bold text-totc-navy"
                                    title="Duration in minutes"
                                  />
                                </div>

                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-totc-navy font-semibold shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={lesson.isFreePreview}
                                    onChange={(e) => handleLessonChange(sIdx, lIdx, 'isFreePreview', e.target.checked)}
                                    className="rounded text-totc-teal focus:ring-totc-teal"
                                  />
                                  <span>Free</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Lesson Summary / Content */}
                          <div>
                            <input
                              type="text"
                              value={lesson.contentText || ''}
                              onChange={(e) => handleLessonChange(sIdx, lIdx, 'contentText', e.target.value)}
                              placeholder="Key concepts or cheat sheet notes for this lecture..."
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50/70 focus:bg-white focus:border-totc-teal outline-none text-[11px] text-totc-gray transition-colors"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      <button
                        type="button"
                        onClick={() => handleAddLesson(sIdx)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lecture to Module {sIdx + 1}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Module</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmitCourse(false)}
                    disabled={submitting || loadingCourse}
                    className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmitCourse(true)}
                    disabled={submitting || loadingCourse}
                    className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {submitting 
                        ? 'Saving...' 
                        : isEditing 
                          ? (currentUser?.role === 'Admin' ? 'Save & Update Course' : 'Save & Resubmit for Approval') 
                          : (currentUser?.role === 'Admin' ? 'Save & Publish Course' : 'Submit for Review')}
                    </span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
