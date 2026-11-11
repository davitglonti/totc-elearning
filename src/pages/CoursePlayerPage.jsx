import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, CheckCircle, ArrowLeft, ArrowRight, BookOpen, 
  Clock, Award, Download, MessageSquare, FileText, Share2, 
  Volume2, Maximize, Check, HelpCircle, Code, ThumbsUp, Send, 
  Plus, Trash2, Sparkles, AlertCircle, Bookmark, Compass 
} from 'lucide-react';
import { api } from '../services/api';

export default function CoursePlayerPage({ activeCourse, setActivePage }) {
  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(255); // 04:15 in seconds
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'quiz', 'resources', 'qa', 'notes'
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [successNotice, setSuccessNotice] = useState('');

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Q&A Discussion State
  const [questionsList, setQuestionsList] = useState([
    {
      id: 1,
      author: 'Giorgi Maisuradze',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      timestamp: '04:15',
      timeSeconds: 255,
      question: 'Why do we place the DynamoDB state machine behind a private VPC endpoint instead of public access?',
      date: '2 hours ago',
      upvotes: 8,
      isUpvoted: false,
      replies: [
        {
          author: 'Lina Wilson (Instructor)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          text: 'Great observation, Giorgi! A VPC endpoint keeps all database payload traffic inside the AWS private backbone, completely eliminating exposure to the public internet and lowering egress transit costs.',
          isInstructor: true
        }
      ]
    },
    {
      id: 2,
      author: 'Mariam Kalandadze',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      timestamp: '08:40',
      timeSeconds: 520,
      question: 'Is it necessary to have multi-AZ failover enabled for staging environments or only for production?',
      date: 'Yesterday',
      upvotes: 4,
      isUpvoted: false,
      replies: [
        {
          author: 'Lina Wilson (Instructor)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          text: 'For staging you can safely use single-AZ to minimize costs, but we always mandate Multi-AZ for production workloads.',
          isInstructor: true
        }
      ]
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [includeTimestampInQuestion, setIncludeTimestampInQuestion] = useState(true);

  // Personal Notes State
  const [notesList, setNotesList] = useState([
    {
      id: 1,
      timestamp: '03:10',
      seconds: 190,
      text: 'CIDR block /16 provides 65,536 private IP addresses for scalable microservices.'
    },
    {
      id: 2,
      timestamp: '07:45',
      seconds: 465,
      text: 'Always pair an Application Load Balancer with Web Application Firewall (WAF) for DDoS mitigations.'
    }
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Helper to ensure local uploaded videos resolve to the backend server
  const resolveVideoUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (trimmed.startsWith('/uploads/')) {
      return `http://localhost:5000${trimmed}`;
    }
    return trimmed;
  };

  // Fallback static course content if API fails
  const defaultCourse = {
    title: activeCourse?.title || 'AWS Certified Solutions Architect & Cloud Operations',
    progressPercentage: activeCourse?.progressPercentage || 45,
    sections: [
      {
        id: 'sec-1',
        title: 'Module 1: Introduction to Cloud Infrastructure',
        lessons: [
          { 
            id: 'les-1', 
            title: 'Welcome to AWS Cloud Fundamentals', 
            durationMinutes: 15, 
            lessonType: 'Video',
            isCompleted: true,
            hasQuiz: true
          },
          { 
            id: 'les-2', 
            title: 'Designing Scalable VPCs and Subnets', 
            durationMinutes: 25, 
            lessonType: 'Video',
            isCompleted: false,
            hasQuiz: false
          },
          { 
            id: 'les-lab', 
            title: 'Hands-on Lab: Configure Multi-AZ Subnets & Route Tables', 
            durationMinutes: 40, 
            lessonType: 'Assignment',
            isCompleted: false,
            hasQuiz: false
          }
        ]
      },
      {
        id: 'sec-2',
        title: 'Module 2: Real-time Gradebook & Webhook Pipelines',
        lessons: [
          { 
            id: 'les-3', 
            title: 'Deploying DynamoDB for Live Student Rosters', 
            durationMinutes: 30, 
            lessonType: 'Video',
            isCompleted: false,
            hasQuiz: true
          },
          { 
            id: 'les-quiz', 
            title: 'Module Quiz: Distributed Systems & Gradebook Architecture', 
            durationMinutes: 20, 
            lessonType: 'Quiz',
            isCompleted: false,
            hasQuiz: true
          }
        ]
      }
    ]
  };

  // Fallback Quiz Data for Lesson 1
  const fallbackQuiz = {
    id: 'quiz-aws-1',
    title: 'Knowledge Check: Cloud Fundamentals',
    description: 'Answer these questions to test your understanding and unlock your lecture completion badge.',
    passingScorePercentage: 70,
    questions: [
      {
        id: 'q-1',
        questionText: 'Which AWS core service provides resizable, secure compute capacity in the cloud?',
        options: [
          { id: 'opt-1-1', optionText: 'Amazon S3 (Simple Storage Service)' },
          { id: 'opt-1-2', optionText: 'Amazon EC2 (Elastic Compute Cloud)' },
          { id: 'opt-1-3', optionText: 'AWS IAM Identity Center' },
          { id: 'opt-1-4', optionText: 'Amazon CloudFront' }
        ],
        correctOptionId: 'opt-1-2',
        explanation: 'Amazon EC2 provides resizable virtual server instances in AWS on-demand.'
      },
      {
        id: 'q-2',
        questionText: 'Which component enables communication between instances in your VPC and the public internet?',
        options: [
          { id: 'opt-2-1', optionText: 'Internet Gateway (IGW)' },
          { id: 'opt-2-2', optionText: 'Security Group Ingress Rule' },
          { id: 'opt-2-3', optionText: 'AWS Direct Connect Terminal' },
          { id: 'opt-2-4', optionText: 'EBS Storage Volume' }
        ],
        correctOptionId: 'opt-2-1',
        explanation: 'An Internet Gateway is horizontally scaled and redundant, connecting VPC route tables to the internet.'
      },
      {
        id: 'q-3',
        questionText: 'What is the primary architectural purpose of a Multi-AZ deployment in AWS?',
        options: [
          { id: 'opt-3-1', optionText: 'Reducing cloud billing costs by 50%' },
          { id: 'opt-3-2', optionText: 'High availability and automatic failover protection' },
          { id: 'opt-3-3', optionText: 'Compressing static assets on disk' },
          { id: 'opt-3-4', optionText: 'Deleting unused IAM policies automatically' }
        ],
        correctOptionId: 'opt-3-2',
        explanation: 'Multi-AZ architectures place synchronous replicas in separate physical data centers for seamless fault tolerance.'
      }
    ]
  };

  // Load Course Content and Curriculum
  useEffect(() => {
    async function fetchCourseDetails() {
      setLoading(true);
      const targetCourseId = activeCourse?.courseId || activeCourse?.id;
      if (targetCourseId) {
        try {
          let data = null;
          try {
            data = await api.learning.getContent(targetCourseId);
          } catch (e) {
            console.warn('api.learning.getContent failed, attempting api.courses.getById:', e.message);
            data = await api.courses.getById(targetCourseId);
          }

          if (data && data.sections && data.sections.length > 0) {
            setCourseContent(data);
            const initialCompleted = new Set();
            data.sections.forEach(sec => {
              sec.lessons?.forEach(les => {
                if (les.isCompleted) initialCompleted.add(les.id);
              });
            });
            setCompletedLessonIds(initialCompleted);

            const allLessons = data.sections.flatMap(s => s.lessons);
            let targetLesson = null;
            if (activeCourse?.targetLessonId) {
              targetLesson = allLessons.find(l => l.id === activeCourse.targetLessonId);
            }
            if (!targetLesson) {
              const firstIncomplete = allLessons.find(l => !l.isCompleted);
              targetLesson = firstIncomplete || allLessons[0];
            }

            if (targetLesson) {
              setActiveLesson(targetLesson);
              loadQuizForLesson(targetLesson.id);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Using local fallback curriculum:', err.message);
        }
      }

      // Fallback
      setCourseContent(defaultCourse);
      const setIds = new Set(['les-1']);
      setCompletedLessonIds(setIds);
      const defaultActive = defaultCourse.sections[0].lessons[0];
      setActiveLesson(defaultActive);
      setQuizData(fallbackQuiz);
      setLoading(false);
    }

    fetchCourseDetails();
  }, [activeCourse]);

  // Load Quiz when lesson changes
  const loadQuizForLesson = async (lessonId) => {
    setSelectedAnswers({});
    setQuizResult(null);

    try {
      const q = await api.quizzes.getByLesson(lessonId);
      if (q && q.questions && q.questions.length > 0) {
        setQuizData(q);
        return;
      }
    } catch (e) {
      // Use fallback quiz
      setQuizData(fallbackQuiz);
    }
  };

  const handleLessonSwitch = (lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(false);
    setCurrentVideoTime(0);

    // If student clicks a Quiz item in the syllabus, automatically open the Quiz tab!
    if (lesson.lessonType === 'Quiz') {
      setActiveTab('quiz');
    }

    loadQuizForLesson(lesson.id);
  };

  // Handle Mark as Complete
  const handleCompleteCurrentLesson = async () => {
    if (!activeLesson) return;

    try {
      await api.learning.completeLesson(activeLesson.id, currentVideoTime, true);
    } catch (e) {
      console.warn('Saved completion locally:', e.message);
    }

    setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
    setSuccessNotice('Lecture marked as complete! 🎉');
    setTimeout(() => setSuccessNotice(''), 3500);

    // Advance to next lesson
    const allLessons = courseContent?.sections?.flatMap(s => s.lessons) || [];
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      handleLessonSwitch(allLessons[currentIndex + 1]);
    }
  };

  // Quiz Answer Selection
  const handleSelectOption = (questionId, optionId) => {
    if (quizResult) return; // Prevent changing after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Submit Quiz for evaluation
  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setIsSubmittingQuiz(true);

    try {
      // Try backend submission
      const res = await api.quizzes.submit(quizData.id, selectedAnswers);
      setQuizResult(res);

      if (res.passed) {
        setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
        setSuccessNotice('Quiz Passed! Lecture completed! 🎉');
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } catch (e) {
      // Local evaluation fallback
      const questions = quizData.questions || [];
      let correct = 0;
      const feedbacks = questions.map(q => {
        const selected = selectedAnswers[q.id];
        const isRight = selected === q.correctOptionId;
        if (isRight) correct++;
        return {
          questionId: q.id,
          selectedOptionId: selected,
          correctOptionId: q.correctOptionId,
          isCorrect: isRight,
          explanation: q.explanation || 'Verified architectural best practice.'
        };
      });

      const pct = Math.round((correct / questions.length) * 100);
      const passed = pct >= (quizData.passingScorePercentage || 70);

      const localRes = {
        totalQuestions: questions.length,
        correctAnswersCount: correct,
        scorePercentage: pct,
        passed,
        feedbackMessage: passed
          ? `🎉 Excellent! You scored ${pct}% and successfully completed this check.`
          : `You scored ${pct}%. Review the lecture and try again!`,
        questionFeedbacks: feedbacks
      };

      setQuizResult(localRes);

      if (passed) {
        setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
        setSuccessNotice('Quiz Passed! Lecture completed! 🎉');
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Add Community Question
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const mins = Math.floor(currentVideoTime / 60);
    const secs = currentVideoTime % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const newQ = {
      id: Date.now(),
      author: 'You (Davit Glonti)',
      avatar: '/assets/testimonial_avatar.png',
      timestamp: includeTimestampInQuestion ? timeFormatted : 'General',
      timeSeconds: currentVideoTime,
      question: newQuestionText.trim(),
      date: 'Just now',
      upvotes: 0,
      isUpvoted: false,
      replies: []
    };

    setQuestionsList([newQ, ...questionsList]);
    setNewQuestionText('');
  };

  // Add Personal Note
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const mins = Math.floor(currentVideoTime / 60);
    const secs = currentVideoTime % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const note = {
      id: Date.now(),
      timestamp: timeFormatted,
      seconds: currentVideoTime,
      text: newNoteText.trim()
    };

    setNotesList([note, ...notesList]);
    setNewNoteText('');
  };

  const handleSeekToTime = (seconds) => {
    setCurrentVideoTime(seconds);
    setIsPlaying(true);
  };

  const allLessons = courseContent?.sections?.flatMap(s => s.lessons) || [];
  const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const currentProgressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="pt-20 bg-[#0F172A] text-white min-h-screen flex flex-col font-poppins">
      
      {/* Top Header Bar */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                setActivePage('courses');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-totc-teal font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <h1 className="font-semibold text-base sm:text-lg text-white truncate max-w-md sm:max-w-xl">
            {courseContent?.title || activeCourse?.title}
          </h1>
        </div>

        {/* Course Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{completedCount} / {allLessons.length} Completed</span>
          </div>
          <div className="w-32 h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-totc-teal transition-all duration-300 rounded-full"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-totc-teal">{currentProgressPercent}%</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1700px] mx-auto w-full">
        
        {/* Left Column: Player & Interactive Tabs (8 Cols) */}
        <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col space-y-6">
          
          {/* Video Container with Bunny Stream / HTML5 Player */}
          <div className="relative rounded-[24px] overflow-hidden bg-black shadow-2xl aspect-video flex items-center justify-center group border border-slate-800">
            {activeLesson?.videoUrl && (activeLesson.videoUrl.includes('iframe.mediadelivery.net') || activeLesson.videoUrl.includes('embed')) ? (
              <iframe
                key={activeLesson.id || activeLesson.videoUrl}
                src={activeLesson.videoUrl}
                loading="lazy"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
                title={activeLesson.title || 'Lecture Video Stream'}
              />
            ) : activeLesson?.videoUrl ? (
              <video
                key={activeLesson.id || activeLesson.videoUrl}
                src={resolveVideoUrl(activeLesson.videoUrl)}
                controls
                className="w-full h-full object-contain absolute inset-0 bg-black"
                playsInline
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900 absolute inset-0">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Video className="w-8 h-8 text-totc-teal" />
                </div>
                <h4 className="font-bold text-base text-white">No Video Uploaded Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  The instructor has not attached a video file to this lecture ({activeLesson?.title || 'Lecture'}).
                </p>
              </div>
            )}
          </div>

          {/* Active Lecture Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-totc-teal uppercase tracking-wider">
                  Active Lesson
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-medium">
                  {activeLesson?.lessonType || 'Video'}
                </span>
              </div>
              <h2 className="font-bold text-xl text-white">
                {activeLesson?.title || '1. Welcome to AWS Cloud Fundamentals'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {completedLessonIds.has(activeLesson?.id) ? (
                <div className="px-4 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleCompleteCurrentLesson}
                  className="px-5 py-2.5 rounded-full bg-totc-teal text-white hover:bg-totc-teal-dark text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>
          </div>

          {successNotice && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* =========================================================================
              HORIZONTAL TABS BAR (Overview, Quiz, Resources, Q&A, Notes)
              ========================================================================= */}
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60 space-y-6">
            
            <div className="flex border-b border-slate-700 gap-4 sm:gap-8 overflow-x-auto pb-1 text-sm font-semibold">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen, badge: null },
                { id: 'quiz', label: 'Knowledge Check Quiz', icon: HelpCircle, badge: quizData?.questions?.length || 3 },
                { id: 'resources', label: 'Resources & Code', icon: Download, badge: '3 files' },
                { id: 'qa', label: 'Q&A Discussion', icon: MessageSquare, badge: questionsList.length },
                { id: 'notes', label: 'Personal Notes', icon: FileText, badge: notesList.length },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-totc-teal text-totc-teal'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-totc-teal/20 text-totc-teal font-bold' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                <div className="space-y-2">
                  <h4 className="font-bold text-base text-white">About this Lecture</h4>
                  <p className="text-slate-300 text-sm">
                    {activeLesson?.contentText || 'Master state-of-the-art cloud architecture, distributed systems, resilient virtual classroom pipelines, and certification preparation.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Duration</p>
                      <p className="font-bold text-white">{activeLesson?.durationMinutes || 15} minutes</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Award className="w-5 h-5 text-totc-teal shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Skill Level</p>
                      <p className="font-bold text-white">Intermediate to Advanced</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Prerequisite</p>
                      <p className="font-bold text-white">Basic Networking</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-totc-cyan">Key Takeaways:</h5>
                  <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
                    <li>Establishing high-availability VPC topologies across minimum 2 Availability Zones.</li>
                    <li>Configuring private subnet routing through Network Address Translation (NAT) gateways.</li>
                    <li>Enforcing zero-trust network boundary rules via stateless Network ACLs and stateful Security Groups.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE QUIZ (Knowledge Check) */}
            {activeTab === 'quiz' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {quizData?.title || 'Knowledge Check: Cloud Fundamentals'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Answer the questions below to test your understanding and unlock your lecture completion badge.
                    </p>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal text-xs font-bold shrink-0">
                    Passing: {quizData?.passingScorePercentage || 70}%
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {quizData?.questions?.map((q, qIndex) => {
                    const selectedOptId = selectedAnswers[q.id];
                    const feedback = quizResult?.questionFeedbacks?.find(f => f.questionId === q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          feedback
                            ? feedback.isCorrect
                              ? 'bg-emerald-950/20 border-emerald-500/50'
                              : 'bg-red-950/20 border-red-500/50'
                            : 'bg-slate-800/60 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <h4 className="font-bold text-sm text-white leading-snug">
                            {q.questionText}
                          </h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5 pl-9">
                          {q.options?.map((opt) => {
                            const isSelected = selectedOptId === opt.id;
                            const isCorrectAnswer = feedback && feedback.correctOptionId === opt.id;
                            const isSelectedWrong = feedback && isSelected && !feedback.isCorrect;

                            return (
                              <button
                                key={opt.id}
                                disabled={quizResult !== null}
                                onClick={() => handleSelectOption(q.id, opt.id)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                    : isSelectedWrong
                                    ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                                    : isSelected
                                    ? 'bg-totc-teal/20 border-totc-teal text-white shadow-sm'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                                }`}
                              >
                                <span>{opt.optionText}</span>
                                {isCorrectAnswer && <Check className="w-4 h-4 text-emerald-400" />}
                                {isSelectedWrong && <X className="w-4 h-4 text-red-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Feedback */}
                        {feedback && (
                          <div className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                            feedback.isCorrect
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-300 border border-red-500/20'
                          }`}>
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span><strong>Explanation:</strong> {feedback.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quiz Action / Result Summary */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-700">
                  {quizResult ? (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        quizResult.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {quizResult.scorePercentage}%
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${quizResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                          {quizResult.passed ? 'Assessment Passed! 🎉' : 'Assessment Failed'}
                        </p>
                        <p className="text-xs text-slate-400">{quizResult.feedbackMessage}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Answer all questions to submit for grading.
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    {quizResult ? (
                      <button
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizResult(null);
                        }}
                        className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                      >
                        Retake Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < (quizData?.questions?.length || 1)}
                        className={`px-8 py-3 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                          Object.keys(selectedAnswers).length >= (quizData?.questions?.length || 1)
                            ? 'bg-totc-teal text-white hover:bg-totc-teal-dark'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isSubmittingQuiz ? 'Grading...' : 'Check My Answers'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RESOURCES & CODE */}
            {activeTab === 'resources' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-700">
                  <h4 className="font-bold text-base text-white">Downloadable Assets & Source Code</h4>
                  <p className="text-xs text-slate-400">
                    All lab configuration code, cheatsheets, and slides used in this lecture.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: 'aws_vpc_multi_az_starter_template.zip',
                      desc: 'Terraform and CloudFormation starter templates with public/private subnet declarations.',
                      size: '4.8 MB',
                      type: 'Source Code'
                    },
                    {
                      name: 'cloud_architect_lecture_slides_module1.pdf',
                      desc: 'Full high-res presentation slides and architectural decision rubrics.',
                      size: '12.4 MB',
                      type: 'Slides'
                    },
                    {
                      name: 'dynamodb_gradebook_schema_cheatsheet.pdf',
                      desc: 'Single-table design patterns, partition keys, and secondary index configuration guide.',
                      size: '1.2 MB',
                      type: 'Cheatsheet'
                    }
                  ].map((res, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-totc-teal/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-totc-teal/15 text-totc-teal flex items-center justify-center shrink-0 mt-0.5">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{res.name}</p>
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{res.desc}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-totc-cyan">
                            {res.type} • {res.size}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Starting download for ${res.name}`)}
                        className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-totc-teal hover:text-white text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* External GitHub Repo Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-indigo-950/60 border border-slate-700 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-white">Course GitHub Repository</p>
                    <p className="text-[11px] text-slate-400">Clone the complete repo: git clone https://github.com/davitglonti/totc-elearning.git</p>
                  </div>
                  <a
                    href="https://github.com/davitglonti/totc-elearning"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-totc-teal hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 4: Q&A DISCUSSION */}
            {activeTab === 'qa' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Ask a Question Box */}
                <form onSubmit={handleAddQuestion} className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Ask a Question</span>
                    <label className="flex items-center gap-2 text-xs text-totc-cyan cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTimestampInQuestion}
                        onChange={(e) => setIncludeTimestampInQuestion(e.target.checked)}
                        className="rounded border-slate-700 text-totc-teal focus:ring-0"
                      />
                      <span>Tag current video time ({formatSeconds(currentVideoTime)})</span>
                    </label>
                  </div>

                  <textarea
                    rows="2"
                    required
                    placeholder="Ask instructors and peers about this lecture..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-totc-teal"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Question</span>
                    </button>
                  </div>
                </form>

                {/* Questions Thread */}
                <div className="space-y-4">
                  {questionsList.map((q) => (
                    <div key={q.id} className="p-4 sm:p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={q.avatar}
                            alt={q.author}
                            className="w-8 h-8 rounded-full object-cover border border-totc-teal"
                          />
                          <div>
                            <span className="font-bold text-xs text-white">{q.author}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{q.date}</span>
                          </div>
                        </div>

                        {q.timestamp !== 'General' && (
                          <button
                            onClick={() => handleSeekToTime(q.timeSeconds)}
                            className="px-2.5 py-1 rounded-full bg-totc-cyan/15 text-totc-cyan font-mono text-[11px] font-bold hover:bg-totc-cyan hover:text-slate-950 transition-colors flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{q.timestamp}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed pl-11">
                        {q.question}
                      </p>

                      {/* Replies */}
                      {q.replies && q.replies.length > 0 && (
                        <div className="ml-11 mt-3 space-y-2 border-l-2 border-slate-700 pl-4">
                          {q.replies.map((reply, rIdx) => (
                            <div key={rIdx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={reply.avatar}
                                  alt={reply.author}
                                  className="w-6 h-6 rounded-full object-cover border border-purple-400"
                                />
                                <span className="font-bold text-xs text-totc-cyan">{reply.author}</span>
                                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold uppercase">
                                  Instructor
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {reply.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 5: PERSONAL NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-700">
                  <h4 className="font-bold text-base text-white">My Timestamped Notes</h4>
                  <p className="text-xs text-slate-400">
                    Capture key concepts during lecture playback. Clicking a timestamp jumps the video straight to that moment.
                  </p>
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Create note at:</span>
                    <span className="font-mono text-totc-cyan bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                      ⏱️ {formatSeconds(currentVideoTime)}
                    </span>
                  </div>

                  <textarea
                    rows="2"
                    required
                    placeholder="Write a personal takeaway or formula..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-totc-teal"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-totc-teal-dark shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-3">
                  {notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-start justify-between gap-4 group"
                    >
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleSeekToTime(note.seconds)}
                          className="px-2.5 py-0.5 rounded-full bg-totc-cyan/20 hover:bg-totc-cyan hover:text-slate-950 text-totc-cyan font-mono text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{note.timestamp}</span>
                        </button>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {note.text}
                        </p>
                      </div>

                      <button
                        onClick={() => setNotesList(notesList.filter(n => n.id !== note.id))}
                        className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Course Content / Syllabus (4 Cols) */}
        <div className="lg:col-span-4 bg-[#1E293B] border-t lg:border-t-0 lg:border-l border-slate-700/80 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-white">Course Content</h3>
            <p className="text-xs text-slate-400">
              {courseContent?.sections?.length || 2} modules • {allLessons.length} syllabus items
            </p>
          </div>

          {/* Modules Accordion */}
          <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
            {courseContent?.sections?.map((section, sIdx) => (
              <div
                key={section.id || sIdx}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden"
              >
                <div className="p-3.5 bg-slate-800 border-b border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 truncate pr-2">{section.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{section.lessons?.length || 0} items</span>
                </div>

                <div className="divide-y divide-slate-700/40">
                  {section.lessons?.map((lesson, lIdx) => {
                    const isCurrent = activeLesson?.id === lesson.id;
                    const isDone = completedLessonIds.has(lesson.id);
                    const type = lesson.lessonType || 'Video';

                    return (
                      <button
                        key={lesson.id || lIdx}
                        onClick={() => handleLessonSwitch(lesson)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-totc-teal/15 text-white font-medium border-l-4 border-totc-teal'
                            : 'hover:bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {/* Type Icon & Completion Indicator */}
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : type === 'Quiz' ? (
                            <HelpCircle className="w-4 h-4 text-purple-400" />
                          ) : type === 'Assignment' ? (
                            <Code className="w-4 h-4 text-amber-400" />
                          ) : isCurrent ? (
                            <Play className="w-4 h-4 text-totc-teal fill-totc-teal animate-pulse" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs line-clamp-2 ${isCurrent ? 'font-bold text-totc-cyan' : ''}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              type === 'Quiz'
                                ? 'bg-purple-500/20 text-purple-300'
                                : type === 'Assignment'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {type}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.durationMinutes || 15} mins
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}