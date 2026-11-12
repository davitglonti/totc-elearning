import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Video, FileText, CheckCircle, 
  HelpCircle, Clock, Sparkles, BookOpen, Layers, DollarSign, 
  Image as ImageIcon, Globe, Eye, EyeOff, Save, AlertCircle, RefreshCw,
  UploadCloud, Check, Loader2, Play, Paperclip, FileCode, FolderArchive,
  Download, ChevronDown, ChevronUp, CheckSquare, X
} from 'lucide-react';
import { api } from '../services/api';

const PRESET_THUMBNAILS = [
  { label: 'ქლაუდი და DevOps', url: '/assets/explore_row_1.png' },
  { label: 'UI/UX დიზაინი', url: '/assets/explore_row_2.png' },
  { label: 'ფოტოგრაფია და მედია', url: '/assets/explore_row_3.png' },
  { label: 'პროგრამირება', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
  { label: 'ბიზნესი და ტექნოლოგიები', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80' },
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
  const [uploadingResourceKey, setUploadingResourceKey] = useState(null); // e.g. "sIdx-lIdx"

  const handleResourceUpload = async (sIdx, lIdx, file) => {
    if (!file) return;
    const itemKey = `${sIdx}-${lIdx}`;
    setUploadingResourceKey(itemKey);

    try {
      const res = await api.instructor.uploadMedia(file);
      const fullUrl = res.url?.startsWith('/') ? `http://localhost:5000${res.url}` : res.url;

      // Format readable size
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      // Determine readable file category
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
  const [expandedQuizKey, setExpandedQuizKey] = useState(null); // e.g. "sIdx-lIdx"

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
                <span>კურსის ძირითადი მონაცემები</span>
              </h3>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  კურსის სათაური <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="მაგ: AWS Cloud არქიტექტურა და DevOps"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  მიმოხილვა / აღწერა
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="მოკლედ აღწერეთ რას ისწავლიან სტუდენტები ამ კურსში..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-totc-teal focus:ring-2 focus:ring-totc-teal/20 outline-none text-sm transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                  მიმართულება / კატეგორია
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
                    <option value="">ზოგადი განვითარება</option>
                  )}
                </select>
              </div>

              {/* Level & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                    სირთულის დონე
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-medium transition-all bg-white"
                  >
                    <option value="Beginner">დამწყები</option>
                    <option value="Intermediate">საშუალო</option>
                    <option value="Advanced">პროფესიონალი</option>
                    <option value="AllLevels">ყველა დონე</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-totc-navy uppercase tracking-wider">
                    ფასი (₾ GEL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₾</span>
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
                <span>კურსის გარეკანი</span>
              </h3>

              {/* Current Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200 shadow-inner">
                <img
                  src={thumbnailUrl || '/assets/explore_row_1.png'}
                  alt="გარეკანის გადახედვა"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Custom Image File Upload Dropzone */}
              <div>
                <label className={`cursor-pointer w-full p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
                  uploadingArtwork
                    ? 'bg-amber-50 border-amber-300 pointer-events-none'
                    : 'bg-teal-50/40 hover:bg-teal-50 border-teal-200 hover:border-totc-teal'
                }`}>
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-totc-teal flex items-center justify-center shrink-0">
                    {uploadingArtwork ? (
                      <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-totc-teal" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-totc-navy">
                      {uploadingArtwork ? 'იტვირთება გარეკანის ფოტო...' : 'ატვირთე საჩვენებელი ფოტო'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      აირჩიეთ PNG, JPG ან WebP ფაილი (მაქს. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingArtwork}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleArtworkUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">
                  აირჩიეთ მზა სურათი
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
                  ან ჩასვით სურათის ბმული (URL)
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
                    <span>სასწავლო გეგმა და ვიდეო ლექციები</span>
                  </h3>
                  <p className="text-xs text-totc-gray mt-0.5">
                    ააწყვეთ მრავალმოდულიანი სტრუქტურა, ატვირთეთ ვიდეოები და მონიშნეთ უფასო საჩვენებელი ლექციები.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>მოდულის დამატება</span>
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
                          placeholder={`მოდული ${sIdx + 1}-ის სათაური`}
                          className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 focus:border-indigo-600 outline-none text-sm font-bold text-totc-navy transition-all"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sIdx)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="მოდულის წაშლა"
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
                                placeholder="ლექციის სათაური"
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-xs font-semibold text-totc-navy"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveLesson(sIdx, lIdx)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                              title="ლექციის წაშლა"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Video Upload & Stream Settings (Strictly File Upload - No Link/URL Input) */}
                          <div className="space-y-2 pt-1">
                            {/* If no video uploaded yet: show prominent upload area */}
                            {!lesson.videoUrl ? (
                              <label className={`cursor-pointer w-full p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                                uploadingKey === `${sIdx}-${lIdx}`
                                  ? 'bg-amber-50 border-amber-300 pointer-events-none'
                                  : 'bg-indigo-50/40 hover:bg-indigo-50/80 border-indigo-200 hover:border-indigo-400'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    {uploadingKey === `${sIdx}-${lIdx}` ? (
                                      <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                                    ) : (
                                      <UploadCloud className="w-5 h-5 text-indigo-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-indigo-950">
                                      {uploadingKey === `${sIdx}-${lIdx}` ? `იტვირთება ვიდეო (${uploadProgress}%)...` : 'ატვირთეთ ლექციის ვიდეო ფაილი'}
                                    </p>
                                    <p className="text-[11px] text-indigo-600/80">
                                      აირჩიეთ MP4, MOV ან WebM ფაილი (მაქს. 2GB). იტვირთება პირდაპირ Bunny CDN-ზე.
                                    </p>
                                  </div>
                                </div>

                                <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-colors shrink-0">
                                  ვიდეოს არჩევა
                                </span>

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
                            ) : (
                              /* If video is already uploaded and attached */
                              <div className="p-3 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                                    <Video className="w-4 h-4 text-teal-700" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                        {lesson.videoUrl.includes('mediadelivery.net') || lesson.videoUrl.includes('b-cdn.net')
                                          ? '⚡ Bunny Stream CDN ვიდეო მზადაა'
                                          : '📁 ვიდეო ფაილი მიმაგრებულია'}
                                      </span>
                                      <a
                                        href={lesson.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-teal-700 hover:text-teal-900 font-bold underline"
                                      >
                                        გადახედვა
                                      </a>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono truncate max-w-xs sm:max-w-md">
                                      {lesson.videoUrl.split('/').pop()}
                                    </p>
                                  </div>
                                </div>

                                {/* Action buttons: Replace or Remove */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border shadow-xs ${
                                    uploadingKey === `${sIdx}-${lIdx}`
                                      ? 'bg-amber-50 text-amber-700 border-amber-300 pointer-events-none'
                                      : 'bg-white hover:bg-gray-50 text-totc-navy border-gray-200'
                                  }`}>
                                    {uploadingKey === `${sIdx}-${lIdx}` ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                        <span>იტვირთება ({uploadProgress}%)...</span>
                                      </>
                                    ) : (
                                      <>
                                        <UploadCloud className="w-3.5 h-3.5 text-totc-teal" />
                                        <span>ვიდეოს შეცვლა</span>
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

                                  <button
                                    type="button"
                                    onClick={() => handleLessonChange(sIdx, lIdx, 'videoUrl', '')}
                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                    title="მიმაგრებული ვიდეოს წაშლა"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Active Upload Progress Bar */}
                            {uploadingKey === `${sIdx}-${lIdx}` && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                                  <span className="flex items-center gap-1.5">
                                    <UploadCloud className="w-4 h-4 animate-bounce text-amber-600" />
                                    მიმდინარეობს ვიდეო ნაკადის ატვირთვა Bunny CDN-ზე...
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

                            {/* Upload Notice (Success / Error toast) */}
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

                            {/* Lecture Metadata Row: Duration & Free Preview */}
                            <div className="flex items-center justify-between gap-4 pt-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-totc-gray flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  ხანგრძლივობა:
                                </span>
                                <div className="relative w-24">
                                  <input
                                    type="number"
                                    min="1"
                                    value={lesson.durationMinutes}
                                    onChange={(e) => handleLessonChange(sIdx, lIdx, 'durationMinutes', e.target.value)}
                                    placeholder="წთ"
                                    className="w-full px-2.5 py-1 rounded-lg border border-gray-200 focus:border-totc-teal outline-none text-xs font-bold text-totc-navy"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-semibold">წთ</span>
                                </div>
                              </div>

                              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-totc-navy font-semibold shrink-0">
                                <input
                                  type="checkbox"
                                  checked={lesson.isFreePreview}
                                  onChange={(e) => handleLessonChange(sIdx, lIdx, 'isFreePreview', e.target.checked)}
                                  className="rounded text-totc-teal focus:ring-totc-teal"
                                />
                                <span>უფასო ნახვა</span>
                              </label>
                            </div>
                          </div>

                          {/* Lesson Summary / Content */}
                          <div>
                            <input
                              type="text"
                              value={lesson.contentText || ''}
                              onChange={(e) => handleLessonChange(sIdx, lIdx, 'contentText', e.target.value)}
                              placeholder="ლექციის მოკლე აღწერა ან ძირითადი თეზისები..."
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-100 bg-gray-50/70 focus:bg-white focus:border-totc-teal outline-none text-[11px] text-totc-gray transition-colors"
                            />
                          </div>

                          {/* Attached Downloadable Resources */}
                          <div className="pt-2 border-t border-gray-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-totc-navy flex items-center gap-1.5">
                                <Paperclip className="w-3.5 h-3.5 text-totc-teal" />
                                <span>ჩამოსატვირთი მასალები ({lesson.resources?.length || 0})</span>
                              </span>

                              <label className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border shadow-2xs ${
                                uploadingResourceKey === `${sIdx}-${lIdx}`
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 pointer-events-none'
                                  : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}>
                                {uploadingResourceKey === `${sIdx}-${lIdx}` ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                                    <span>იტვირთება...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3 h-3" />
                                    <span>+ ფაილის მიმაგრება (PDF, ZIP, კოდი)</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  disabled={uploadingResourceKey === `${sIdx}-${lIdx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleResourceUpload(sIdx, lIdx, e.target.files[0]);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Files list */}
                            {lesson.resources && lesson.resources.length > 0 && (
                              <div className="space-y-1.5">
                                {lesson.resources.map((res, rIdx) => (
                                  <div
                                    key={res.id || rIdx}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="w-3.5 h-3.5 text-totc-teal shrink-0" />
                                      <span className="font-semibold text-totc-navy truncate max-w-[200px] sm:max-w-xs">
                                        {res.name}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                        ({res.size || res.fileSize})
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveResource(sIdx, lIdx, rIdx)}
                                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors shrink-0"
                                      title="Remove attachment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Knowledge Check Quiz Section */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!lesson.quiz) {
                                    handleToggleQuiz(sIdx, lIdx);
                                  } else {
                                    setExpandedQuizKey(expandedQuizKey === `${sIdx}-${lIdx}` ? null : `${sIdx}-${lIdx}`);
                                  }
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                                <span>
                                  {lesson.quiz 
                                    ? `ცოდნის შემოწმების ტესტი (${lesson.quiz.questions?.length || 0} კითხვა)`
                                    : '+ ცოდნის შემოწმების ტესტის დამატება'}
                                </span>
                                {lesson.quiz && (
                                  expandedQuizKey === `${sIdx}-${lIdx}` ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {lesson.quiz && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuiz(sIdx, lIdx)}
                                  className="text-[10px] text-red-500 hover:underline font-semibold"
                                >
                                  ტესტის წაშლა
                                </button>
                              )}
                            </div>

                            {/* Expanded Quiz Editor */}
                            {lesson.quiz && expandedQuizKey === `${sIdx}-${lIdx}` && (
                              <div className="mt-3 p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-4 animate-in fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="sm:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-purple-900 uppercase">ტესტის სათაური</label>
                                    <input
                                      type="text"
                                      value={lesson.quiz.title}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[sIdx].lessons[lIdx].quiz.title = e.target.value;
                                        setSections(updated);
                                      }}
                                      placeholder="მაგ: ცოდნის შემოწმება: ქლაუდ არქიტექტურა"
                                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-purple-200 text-xs font-semibold text-totc-navy"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-purple-900 uppercase">გამსვლელი ქულა %</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="100"
                                      value={lesson.quiz.passingScorePercentage || 70}
                                      onChange={(e) => {
                                        const updated = [...sections];
                                        updated[sIdx].lessons[lIdx].quiz.passingScorePercentage = parseInt(e.target.value, 10) || 70;
                                        setSections(updated);
                                      }}
                                      className="w-full px-3 py-1.5 bg-white rounded-lg border border-purple-200 text-xs font-bold text-totc-navy"
                                    />
                                  </div>
                                </div>

                                {/* Questions */}
                                <div className="space-y-3">
                                  {lesson.quiz.questions?.map((q, qIdx) => (
                                    <div key={q.id || qIdx} className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-2.5">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                            Q{qIdx + 1}
                                          </span>
                                          <input
                                            type="text"
                                            value={q.questionText}
                                            onChange={(e) => handleQuizQuestionChange(sIdx, lIdx, qIdx, 'questionText', e.target.value)}
                                            placeholder="ჩაწერეთ კითხვის ტექსტი აქ..."
                                            className="flex-1 px-2.5 py-1 rounded-lg border border-gray-200 focus:border-purple-600 outline-none text-xs font-semibold text-totc-navy"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveQuizQuestion(sIdx, lIdx, qIdx)}
                                          className="text-gray-400 hover:text-red-500 p-1"
                                          title="კითხვის წაშლა"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Options */}
                                      <div className="space-y-1.5 pl-7">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                          ვარიანტები (მონიშნეთ სწორი პასუხი მწვანე ღილაკით):
                                        </span>
                                        {q.options?.map((opt, oIdx) => (
                                          <div key={opt.id || oIdx} className="flex items-center gap-2">
                                            <input
                                              type="radio"
                                              name={`correct-q-${sIdx}-${lIdx}-${qIdx}`}
                                              checked={Boolean(opt.isCorrect)}
                                              onChange={() => handleSetCorrectOption(sIdx, lIdx, qIdx, oIdx)}
                                              className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                              title="მონიშნეთ სწორ პასუხად"
                                            />
                                            <input
                                              type="text"
                                              value={opt.optionText}
                                              onChange={(e) => handleQuizOptionChange(sIdx, lIdx, qIdx, oIdx, e.target.value)}
                                              placeholder={`ვარიანტი ${oIdx + 1}`}
                                              className={`flex-1 px-2.5 py-1 rounded-lg border text-xs ${
                                                opt.isCorrect 
                                                  ? 'border-emerald-400 bg-emerald-50/50 text-emerald-950 font-bold'
                                                  : 'border-gray-200 text-totc-navy'
                                              }`}
                                            />
                                            {opt.isCorrect && (
                                              <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓ სწორია</span>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveQuizOption(sIdx, lIdx, qIdx, oIdx)}
                                              className="text-gray-400 hover:text-red-500 p-1"
                                              title="ვარიანტის წაშლა"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          type="button"
                                          onClick={() => handleAddQuizOption(sIdx, lIdx, qIdx)}
                                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 mt-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>ვარიანტის დამატება</span>
                                        </button>
                                      </div>

                                      {/* Explanation */}
                                      <div className="pl-7 pt-1">
                                        <input
                                          type="text"
                                          value={q.explanation || ''}
                                          onChange={(e) => handleQuizQuestionChange(sIdx, lIdx, qIdx, 'explanation', e.target.value)}
                                          placeholder="განმარტება სტუდენტებისთვის პასუხის გაცემის შემდეგ (არასავალდებულო)..."
                                          className="w-full px-2.5 py-1 rounded-lg border border-purple-100 bg-purple-50/30 text-[11px] text-totc-gray"
                                        />
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => handleAddQuizQuestion(sIdx, lIdx)}
                                    className="w-full py-2 rounded-xl bg-purple-100/70 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>კითხვის დამატება ტესტში</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson & Add Final Exam Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddLesson(sIdx)}
                          className="py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ ლექციის დამატება</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddFinalExam(sIdx)}
                          className="py-2.5 px-4 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-100/50 text-purple-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                          <span>+ მოდულის ფინალური გამოცდა</span>
                        </button>
                      </div>
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
                  <span>ახალი მოდულის დამატება</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmitCourse(false)}
                    disabled={submitting || loadingCourse}
                    className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>მონახაზად შენახვა</span>
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
                        ? 'ინახება...' 
                        : isEditing 
                          ? (currentUser?.role === 'Admin' ? 'შენახვა და განახლება' : 'შენახვა და განხილვაზე გაგზავნა') 
                          : (currentUser?.role === 'Admin' ? 'შენახვა და გამოქვეყნება' : 'განხილვაზე გაგზავნა')}
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
