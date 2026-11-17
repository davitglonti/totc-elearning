import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, BookOpen, Save, Sparkles, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { CourseMetadataForm, CurriculumBuilder } from '../components/course-builder';

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
  const [isOpenAccess, setIsOpenAccess] = useState(courseToEdit?.isOpenAccess ?? false);

  // Curriculum Builder (Modules & Lectures)
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'მოდული 1: დაწყება და ძირითადი საფუძვლები',
      orderIndex: 1,
      lessons: [
        {
          id: 'les-1',
          title: 'კურსის შესავალი და გარემოს მომზადება',
          videoUrl: '',
          durationMinutes: 12,
          contentText: 'კეთილი იყოს თქვენი მობრძანება. ამ ლექციაში მოვამზადებთ სამუშაო გარემოს და განვიხილავთ ძირითად კონცეფციებს.',
          isFreePreview: true,
          lessonType: 'Video',
          orderIndex: 1,
          resources: [],
          quiz: null
        },
        {
          id: 'les-2',
          title: 'არქიტექტურული გეგმა და მონაცემთა ნაკადი',
          videoUrl: '',
          durationMinutes: 20,
          contentText: 'სიღრმისეული მიმოხილვა სისტემური არქიტექტურის, მდგრადი პატერნებისა და საუკეთესო პრაქტიკების შესახებ.',
          isFreePreview: false,
          lessonType: 'Video',
          orderIndex: 2,
          resources: [],
          quiz: null
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
        setIsOpenAccess(!!data.isOpenAccess);

        if (data.sections && data.sections.length > 0) {
          setSections(data.sections.map(s => ({
            id: s.id,
            title: s.title,
            orderIndex: s.orderIndex,
            lessons: (s.lessons || []).map(l => ({
              id: l.id,
              title: l.title,
              videoUrl: l.videoUrl || '',
              durationMinutes: l.durationMinutes || 15,
              contentText: l.contentText || '',
              isFreePreview: !!l.isFreePreview,
              lessonType: l.lessonType || 'Video',
              orderIndex: l.orderIndex,
              resources: l.resources || [],
              quiz: l.quiz ? {
                title: l.quiz.title || `ცოდნის შემოწმება: ${l.title}`,
                description: l.quiz.description || 'შეამოწმეთ ამ ლექციის მასალის ათვისების დონე.',
                passingScorePercentage: l.quiz.passingScorePercentage || 70,
                questions: (l.quiz.questions || []).map(q => ({
                  id: q.id || `q-${Math.random()}`,
                  questionText: q.questionText || '',
                  explanation: q.explanation || '',
                  options: (q.options || []).map(opt => ({
                    id: opt.id || `opt-${Math.random()}`,
                    optionText: opt.optionText || '',
                    isCorrect: !!opt.isCorrect
                  }))
                }))
              } : null
            }))
          })));
        }
      })
      .catch(err => {
        console.warn('Could not load full course for editing:', err.message);
        setErrorMessage('კურსის დეტალების ჩატვირთვა ვერ მოხერხდა: ' + err.message);
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
        title: `მოდული ${newSecNum}: პრაქტიკული გამოყენება`,
        orderIndex: newSecNum,
        lessons: [
          {
            id: `les-${Date.now()}`,
            title: `ლექცია 1: ძირითადი იმპლემენტაცია`,
            videoUrl: '',
            durationMinutes: 15,
            contentText: 'პრაქტიკული განხილვა, დემონსტრაცია და დავალებები.',
            isFreePreview: false,
            lessonType: 'Video',
            orderIndex: 1,
            resources: [],
            quiz: null
          }
        ]
      }
    ]);
  };

  const handleRemoveSection = (secIndex) => {
    if (sections.length <= 1) {
      alert('კურსი უნდა შეიცავდეს მინიმუმ ერთ მოდულს.');
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
      title: `ლექცია ${newLesNum}: პრაქტიკული ვორქშოპი`,
      videoUrl: '',
      durationMinutes: 15,
      contentText: 'ძირითადი კონცეფციები, ვიდეო გაკვეთილი და ნაბიჯ-ნაბიჯ სავარჯიშოები.',
      isFreePreview: false,
      lessonType: 'Video',
      orderIndex: newLesNum,
      resources: [],
      quiz: null
    });
    setSections(updated);
  };

  const handleAddFinalExam = (secIndex) => {
    const updated = [...sections];
    const newLesNum = updated[secIndex].lessons.length + 1;
    updated[secIndex].lessons.push({
      id: `les-${Date.now()}`,
      title: `მოდული ${secIndex + 1} – ფინალური გამოცდა`,
      videoUrl: '',
      durationMinutes: 20,
      contentText: 'მოდულის შემაჯამებელი საგამოცდო ტესტი. სტუდენტმა წარმატებით უნდა ჩააბაროს ეს გამოცდა (მინიმუმ 70%), რათა განბლოკოს შემდეგი მოდული.',
      isFreePreview: false,
      lessonType: 'Quiz',
      orderIndex: newLesNum,
      resources: [],
      quiz: {
        title: `მოდული ${secIndex + 1} – ფინალური გამოცდა`,
        description: 'შემაჯამებელი გამოცდა. საგამოცდო მონიტორინგი და ჩანართის კონტროლი ჩართულია.',
        passingScorePercentage: 70,
        questions: [
          {
            id: `q-${Date.now()}-1`,
            questionText: 'რა არის ამ მოდულის ძირითადი საკვანძო პრინციპი?',
            explanation: 'სწორი პასუხი წარმოადგენს მოდულის მთავარ არქიტექტურულ პრინციპს.',
            options: [
              { id: `opt-${Date.now()}-1`, optionText: 'მთავარი არქიტექტურული პრინციპი და სტანდარტი', isCorrect: true },
              { id: `opt-${Date.now()}-2`, optionText: 'არასწორი ვარიანტი A', isCorrect: false },
              { id: `opt-${Date.now()}-3`, optionText: 'არასწორი ვარიანტი B', isCorrect: false },
              { id: `opt-${Date.now()}-4`, optionText: 'არასწორი ვარიანტი C', isCorrect: false }
            ]
          }
        ]
      }
    });
    setSections(updated);
  };

  const handleRemoveLesson = (secIndex, lesIndex) => {
    const updated = [...sections];
    if (updated[secIndex].lessons.length <= 1) {
      alert('მოდული უნდა შეიცავდეს მინიმუმ ერთ ლექციას.');
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

  // Custom Course Artwork Upload State & Handler
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const handleArtworkUpload = async (file) => {
    if (!file) return;
    setUploadingArtwork(true);
    try {
      const res = await api.instructor.uploadMedia(file);
      const fullUrl = res.url?.startsWith('/') ? `http://localhost:5000${res.url}` : res.url;
      setThumbnailUrl(fullUrl);
      setSuccessMessage('✓ კურსის გარეკანის სურათი წარმატებით აიტვირთა!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Artwork upload error:', err);
      alert('სურათის ატვირთვა ვერ მოხერხდა: ' + (err.message || 'ქსელის შეცდომა'));
    } finally {
      setUploadingArtwork(false);
    }
  };

  // Downloadable Materials / Lesson Resources Upload State & Handlers
  const [uploadingResourceKey, setUploadingResourceKey] = useState(null);

  const handleResourceUpload = async (sIdx, lIdx, file) => {
    if (!file) return;
    const itemKey = `${sIdx}-${lIdx}`;
    setUploadingResourceKey(itemKey);

    try {
      const res = await api.instructor.uploadMedia(file);
      const fullUrl = res.url?.startsWith('/') ? `http://localhost:5000${res.url}` : res.url;

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      let fType = 'დოკუმენტი';
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') fType = 'PDF დოკუმენტი';
      else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) fType = 'არქივი (ZIP)';
      else if (['js', 'jsx', 'ts', 'tsx', 'py', 'cs', 'java', 'html', 'css', 'json'].includes(ext)) fType = 'საწყისი კოდი';
      else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) fType = 'სურათი';

      const newResource = {
        id: `res-${Date.now()}`,
        name: file.name,
        fileUrl: fullUrl,
        size: sizeStr,
        type: fType,
        desc: `ლექციის დანართი (${sizeStr})`
      };

      const updated = [...sections];
      const currentRes = updated[sIdx].lessons[lIdx].resources || [];
      updated[sIdx].lessons[lIdx].resources = [...currentRes, newResource];
      setSections(updated);
    } catch (err) {
      console.error('Resource upload failed:', err);
      alert('ფაილის ატვირთვა ვერ მოხერხდა: ' + (err.message || 'ქსელის შეცდომა'));
    } finally {
      setUploadingResourceKey(null);
    }
  };

  const handleRemoveResource = (sIdx, lIdx, rIdx) => {
    const updated = [...sections];
    const currentRes = updated[sIdx].lessons[lIdx].resources || [];
    updated[sIdx].lessons[lIdx].resources = currentRes.filter((_, idx) => idx !== rIdx);
    setSections(updated);
  };

  // Knowledge Check Quiz Builder Handlers per Lesson
  const [expandedQuizKey, setExpandedQuizKey] = useState(null);

  const handleToggleQuiz = (sIdx, lIdx) => {
    const updated = [...sections];
    const currentLesson = updated[sIdx].lessons[lIdx];
    const itemKey = `${sIdx}-${lIdx}`;

    if (currentLesson.quiz) {
      if (window.confirm('დარწმუნებული ხართ, რომ გსურთ ამ ლექციიდან ტესტის წაშლა?')) {
        currentLesson.quiz = null;
        if (expandedQuizKey === itemKey) setExpandedQuizKey(null);
        setSections(updated);
      }
    } else {
      currentLesson.quiz = {
        title: `ცოდნის შემოწმება: ${currentLesson.title || 'ლექციის ტესტი'}`,
        description: 'უპასუხეთ კითხვებს ლექციის მასალის შესამოწმებლად.',
        passingScorePercentage: 70,
        questions: [
          {
            id: `q-${Date.now()}`,
            questionText: 'რა არის ამ ლექციის მთავარი არქიტექტურული დასკვნა?',
            explanation: 'გადახედეთ ვიდეო ლექციას ძირითადი პრინციპების დასაზუსტებლად.',
            options: [
              { id: `opt-${Date.now()}-1`, optionText: 'პირველი ძირითადი პრინციპი', isCorrect: true },
              { id: `opt-${Date.now()}-2`, optionText: 'ალტერნატიული ვარიანტი', isCorrect: false }
            ]
          }
        ]
      };
      setSections(updated);
      setExpandedQuizKey(itemKey);
    }
  };

  const handleAddQuizQuestion = (sIdx, lIdx) => {
    const updated = [...sections];
    const quiz = updated[sIdx].lessons[lIdx].quiz;
    if (!quiz) return;

    const qNum = (quiz.questions?.length || 0) + 1;
    quiz.questions = [
      ...(quiz.questions || []),
      {
        id: `q-${Date.now()}`,
        questionText: `კითხვა ${qNum}`,
        explanation: '',
        options: [
          { id: `opt-${Date.now()}-1`, optionText: 'ვარიანტი A (სწორი)', isCorrect: true },
          { id: `opt-${Date.now()}-2`, optionText: 'ვარიანტი B', isCorrect: false }
        ]
      }
    ];
    setSections(updated);
  };

  const handleRemoveQuizQuestion = (sIdx, lIdx, qIdx) => {
    const updated = [...sections];
    const quiz = updated[sIdx].lessons[lIdx].quiz;
    if (!quiz || !quiz.questions) return;
    if (quiz.questions.length <= 1) {
      alert('ტესტი უნდა შეიცავდეს მინიმუმ ერთ კითხვას.');
      return;
    }
    quiz.questions = quiz.questions.filter((_, idx) => idx !== qIdx);
    setSections(updated);
  };

  const handleQuizQuestionChange = (sIdx, lIdx, qIdx, field, val) => {
    const updated = [...sections];
    const quiz = updated[sIdx].lessons[lIdx].quiz;
    if (!quiz || !quiz.questions?.[qIdx]) return;
    quiz.questions[qIdx][field] = val;
    setSections(updated);
  };

  const handleAddQuizOption = (sIdx, lIdx, qIdx) => {
    const updated = [...sections];
    const question = updated[sIdx].lessons[lIdx].quiz?.questions?.[qIdx];
    if (!question) return;
    question.options = [
      ...(question.options || []),
      {
        id: `opt-${Date.now()}-${(question.options?.length || 0) + 1}`,
        optionText: `ვარიანტი ${(question.options?.length || 0) + 1}`,
        isCorrect: false
      }
    ];
    setSections(updated);
  };

  const handleRemoveQuizOption = (sIdx, lIdx, qIdx, oIdx) => {
    const updated = [...sections];
    const question = updated[sIdx].lessons[lIdx].quiz?.questions?.[qIdx];
    if (!question || !question.options) return;
    if (question.options.length <= 2) {
      alert('კითხვას უნდა ჰქონდეს მინიმუმ 2 სავარაუდო პასუხი.');
      return;
    }
    const wasCorrect = question.options[oIdx].isCorrect;
    question.options = question.options.filter((_, idx) => idx !== oIdx);
    if (wasCorrect && question.options.length > 0) {
      question.options[0].isCorrect = true;
    }
    setSections(updated);
  };

  const handleQuizOptionChange = (sIdx, lIdx, qIdx, oIdx, text) => {
    const updated = [...sections];
    const question = updated[sIdx].lessons[lIdx].quiz?.questions?.[qIdx];
    if (!question || !question.options?.[oIdx]) return;
    question.options[oIdx].optionText = text;
    setSections(updated);
  };

  const handleSetCorrectOption = (sIdx, lIdx, qIdx, oIdx) => {
    const updated = [...sections];
    const question = updated[sIdx].lessons[lIdx].quiz?.questions?.[qIdx];
    if (!question || !question.options) return;
    question.options.forEach((opt, idx) => {
      opt.isCorrect = (idx === oIdx);
    });
    setSections(updated);
  };

  // Direct Video Upload to Bunny Stream CDN with Live Progress
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadNotice, setUploadNotice] = useState(null);

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

      const finalUrl = res.embedUrl || res.directPlayUrl || res.hlsUrl;
      if (finalUrl) {
        handleLessonChange(sIdx, lIdx, 'videoUrl', finalUrl);
      }

      setUploadNotice({
        key: itemKey,
        isSuccess: true,
        message: res.isBunnyStream 
          ? `✓ ვიდეო დამუშავდა და აიტვირთა Bunny Stream CDN-ზე (ბიბლიოთეკა: ${res.libraryId || '805955'})`
          : `✓ ვიდეო შენახულია სერვერის CDN საცავში: ${res.fileName}`
      });
    } catch (err) {
      console.error('Video upload error:', err);
      setUploadNotice({
        key: itemKey,
        isSuccess: false,
        message: 'ატვირთვა ვერ მოხერხდა: ' + (err.message || 'ქსელის შეცდომა')
      });
    } finally {
      setUploadingKey(null);
    }
  };

  // Submit Course to Backend (Create or Update)
  const handleSubmitCourse = async (publishImmediately) => {
    if (!title.trim()) {
      setErrorMessage('გთხოვთ შეიყვანოთ კურსის სათაური.');
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
        isOpenAccess: Boolean(isOpenAccess),
        resubmitForReview: true,
        sections: sections.map((s, sIdx) => ({
          id: s.id && !String(s.id).startsWith('sec-') ? s.id : null,
          title: s.title.trim(),
          orderIndex: sIdx + 1,
          lessons: s.lessons.map((l, lIdx) => ({
            id: l.id && !String(l.id).startsWith('les-') ? l.id : null,
            title: l.title.trim(),
            videoUrl: l.videoUrl ? l.videoUrl.trim() : '',
            durationMinutes: parseInt(l.durationMinutes, 10) || 15,
            contentText: l.contentText?.trim() || '',
            isFreePreview: !!l.isFreePreview,
            lessonType: l.lessonType || 'Video',
            orderIndex: lIdx + 1,
            resources: (l.resources || []).map(r => ({
              name: r.name?.trim() || 'Lecture Resource',
              fileUrl: r.fileUrl,
              size: r.size || r.fileSize || '1 MB',
              type: r.type || r.fileType || 'File',
              desc: r.desc || r.description || ''
            })),
            quiz: l.quiz && l.quiz.questions?.length > 0 ? {
              title: l.quiz.title?.trim() || `Knowledge Check: ${l.title}`,
              description: l.quiz.description?.trim() || 'Test your knowledge of this lecture.',
              passingScorePercentage: parseInt(l.quiz.passingScorePercentage, 10) || 70,
              questions: l.quiz.questions.map((q, qIdx) => ({
                questionText: q.questionText?.trim() || `Question ${qIdx + 1}`,
                explanation: q.explanation?.trim() || '',
                orderIndex: qIdx + 1,
                options: (q.options || []).map((o, oIdx) => ({
                  optionText: o.optionText?.trim() || `Option ${oIdx + 1}`,
                  isCorrect: Boolean(o.isCorrect),
                  orderIndex: oIdx + 1
                }))
              }))
            } : null
          }))
        }))
      };

      if (isEditing && targetCourseId) {
        // UPDATE EXISTING COURSE
        await api.instructor.updateFullCourse(targetCourseId, payload);
        if (currentUser?.role === 'Admin') {
          setSuccessMessage('🎉 კურსის პროგრამა და ლექციები წარმატებით განახლდა!');
        } else {
          setSuccessMessage('🎉 კურსის პროგრამა განახლდა და ხელახლა გაიგზავნა ადმინისტრატორის განხილვაზე!');
        }
      } else {
        // CREATE BRAND NEW COURSE
        await api.instructor.createFullCourse(payload);
        if (currentUser?.role === 'Admin') {
          setSuccessMessage('🎉 კურსი წარმატებით გამოქვეყნდა TOTC LMS კატალოგში!');
        } else {
          setSuccessMessage('🎉 კურსი გაიგზავნა განხილვაზე! ადმინისტრატორი შეამოწმებს პროგრამას და დამტკიცების შემდეგ გამოაქვეყნებს.');
        }
      }

      // Redirect back to Instructor Studio after 1.5 seconds
      setTimeout(() => {
        setActivePage('instructor-dashboard');
      }, 1500);

    } catch (err) {
      console.error('Failed to save course:', err);
      setErrorMessage(err.message || 'კურსის შენახვა ვერ მოხერხდა. გთხოვთ შეამოწმოთ ველები.');
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
            <span>ინსტრუქტორის სტუდიაში დაბრუნება</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmitCourse(false)}
              disabled={submitting || loadingCourse}
              className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>მონახაზად შენახვა</span>
            </button>

            <button
              onClick={() => handleSubmitCourse(true)}
              disabled={submitting || loadingCourse}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {submitting 
                  ? 'ინახება...' 
                  : isEditing 
                    ? (currentUser?.role === 'Admin' ? 'შენახვა და განახლება' : 'შენახვა და განხილვაზე გაგზავნა') 
                    : (currentUser?.role === 'Admin' ? 'შენახვა და გამოქვეყნება' : 'განხილვაზე გაგზავნა')}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Spinner in Edit Mode */}
        {loadingCourse && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-3 text-totc-teal font-bold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>იტვირთება კურსის სრული პროგრამა და ვიდეო ლექციები...</span>
          </div>
        )}

        {/* Admin Feedback Rejection Banner (If Changes Requested) */}
        {isEditing && approvalStatus === 'Rejected' && rejectionReason && (
          <div className="mb-8 p-6 rounded-[24px] bg-red-50 border-2 border-red-200 text-red-900 space-y-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 font-bold text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="uppercase tracking-wider">ადმინისტრატორის კომენტარი — საჭიროა ცვლილებები</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-red-100 text-sm font-semibold text-red-900 leading-relaxed">
              "{rejectionReason}"
            </div>
            <p className="text-xs text-red-700 font-medium">
              გთხოვთ გაითვალისწინოთ ადმინისტრატორის შენიშვნა (დაამატეთ ან შეცვალეთ ლექციები, განაახლეთ ვიდეოები ან აღწერა) და შემდეგ დააჭირეთ ღილაკს <strong>„შენახვა და განხილვაზე გაგზავნა“</strong>.
            </p>
          </div>
        )}

        {/* Page Banner Title */}
        <div className="mb-8 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEditing ? 'კურსის პროგრამის რედაქტორი' : 'კურსის შექმნის სტუდია'}</span>
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              {isEditing ? `რედაქტირება: ${title || 'კურსი'}` : 'ახალი კურსის შექმნა'}
            </h1>
            <p className="font-poppins text-totc-gray text-sm">
              {isEditing 
                ? 'განაახლეთ კურსის მონაცემები, მართეთ მოდულები, დაამატეთ ან წაშალეთ ვიდეო ლექციები და გაგზავნეთ დასამტკიცებლად.' 
                : 'განსაზღვრეთ კურსის პარამეტრები, დააწყვეთ სასწავლო მოდულები და ატვირთეთ ვიდეო ლექციები.'}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <p className="text-totc-gray font-semibold">მოდულები</p>
              <p className="font-black text-lg text-totc-navy">{sections.length}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-totc-gray font-semibold">სულ ლექცია</p>
              <p className="font-black text-lg text-totc-teal">{totalLecturesCount}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-totc-gray font-semibold">ხანგრძლივობა</p>
              <p className="font-black text-lg text-indigo-700">{Math.round(totalDurationMinutes / 60 * 10) / 10} სთ</p>
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
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Course Meta & Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <CourseMetadataForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              categories={categories}
              level={level}
              setLevel={setLevel}
              price={price}
              setPrice={setPrice}
              isOpenAccess={isOpenAccess}
              setIsOpenAccess={setIsOpenAccess}
              thumbnailUrl={thumbnailUrl}
              setThumbnailUrl={setThumbnailUrl}
              uploadingArtwork={uploadingArtwork}
              handleArtworkUpload={handleArtworkUpload}
            />
          </div>

          {/* RIGHT COLUMN: Curriculum Builder (Modules & Lectures) (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <CurriculumBuilder
              sections={sections}
              setSections={setSections}
              handleAddSection={handleAddSection}
              handleRemoveSection={handleRemoveSection}
              handleSectionTitleChange={handleSectionTitleChange}
              handleAddLesson={handleAddLesson}
              handleAddFinalExam={handleAddFinalExam}
              handleRemoveLesson={handleRemoveLesson}
              handleLessonChange={handleLessonChange}
              uploadingKey={uploadingKey}
              uploadProgress={uploadProgress}
              uploadNotice={uploadNotice}
              setUploadNotice={setUploadNotice}
              handleVideoUpload={handleVideoUpload}
              uploadingResourceKey={uploadingResourceKey}
              handleResourceUpload={handleResourceUpload}
              handleRemoveResource={handleRemoveResource}
              expandedQuizKey={expandedQuizKey}
              setExpandedQuizKey={setExpandedQuizKey}
              handleToggleQuiz={handleToggleQuiz}
              handleAddQuizQuestion={handleAddQuizQuestion}
              handleRemoveQuizQuestion={handleRemoveQuizQuestion}
              handleQuizQuestionChange={handleQuizQuestionChange}
              handleAddQuizOption={handleAddQuizOption}
              handleRemoveQuizOption={handleRemoveQuizOption}
              handleQuizOptionChange={handleQuizOptionChange}
              handleSetCorrectOption={handleSetCorrectOption}
              handleSubmitCourse={handleSubmitCourse}
              submitting={submitting}
              loadingCourse={loadingCourse}
              isEditing={isEditing}
              currentUser={currentUser}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
