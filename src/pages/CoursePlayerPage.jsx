import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, CheckCircle, ArrowLeft, ArrowRight, BookOpen, 
  Clock, Award, Download, MessageSquare, FileText, Share2, 
  Volume2, Maximize, Check, HelpCircle, Code, ThumbsUp, Send, 
  Plus, Trash2, Sparkles, AlertCircle, Bookmark, Compass,
  Video, ExternalLink, Loader2, Lock, FolderArchive, Paperclip, X,
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Timer, Maximize2, Minimize2,
  RefreshCw, EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import BunnyPlayer from '../components/BunnyPlayer';

export default function CoursePlayerPage({ activeCourse, setActivePage, currentUser }) {
  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(255); // 04:15 in seconds
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'quiz', 'resources', 'qa', 'notes'
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [successNotice, setSuccessNotice] = useState('');

  // Module Progression Gating State
  const [passedQuizIds, setPassedQuizIds] = useState(new Set());
  const [moduleUnlockNotice, setModuleUnlockNotice] = useState(null);

  // Anti-Cheating & Exam Integrity Proctoring State
  const [examStrikes, setExamStrikes] = useState(0);
  const [examTerminated, setExamTerminated] = useState(false);
  const [strikeModal, setStrikeModal] = useState({ isOpen: false, strikes: 0, message: '' });
  const [examTimerSeconds, setExamTimerSeconds] = useState(1200); // 20 mins default
  const [proctorToast, setProctorToast] = useState('');
  const [isFullscreenExam, setIsFullscreenExam] = useState(false);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);

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

  const triggerProctorToast = (msg) => {
    setProctorToast(msg);
    setTimeout(() => {
      setProctorToast(prev => prev === msg ? '' : prev);
    }, 2800);
  };

  const shuffleArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const randomizeQuizOptions = (quiz) => {
    if (!quiz || !quiz.questions) return quiz;
    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        options: shuffleArray(q.options || [])
      }))
    };
  };

  const formatExamTime = (totalSeconds) => {
    const mins = Math.max(0, Math.floor(totalSeconds / 60));
    const secs = Math.max(0, totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatCooldownTime = (totalSeconds) => {
    const safeSecs = Math.max(0, totalSeconds || 0);
    const hours = Math.floor(safeSecs / 3600);
    const mins = Math.floor((safeSecs % 3600) / 60);
    const secs = safeSecs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getCooldownStorageKey = (lessonId) => {
    const uId = currentUserId || userEmail || 'student';
    return `totc_cooldown_${uId}_${lessonId || 'default'}`;
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
          },
          {
            id: 'les-exam-1',
            title: 'Module 1 Final Examination: Cloud Infrastructure Mastery',
            durationMinutes: 20,
            lessonType: 'Quiz',
            isCompleted: false,
            hasQuiz: true
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

  // Fallback Exam Quiz Data for Module 1 Final Exam
  const fallbackExamQuiz = {
    id: 'quiz-aws-exam-1',
    title: 'Module 1 Final Examination: Cloud Infrastructure Mastery',
    description: 'ოფიციალური შემაჯამებელი გამოცდა მოდული 1-ისთვის. საგამოცდო მონიტორინგი აქტიურია. მე-2 მოდულზე წვდომისთვის საჭიროა მინიმუმ 70%.',
    passingScorePercentage: 70,
    questions: [
      {
        id: 'qe-1',
        questionText: 'When architecting a fault-tolerant multi-tier web application, where should your relational database replicas reside?',
        options: [
          { id: 'opt-e1-1', optionText: 'In a single public subnet for faster routing' },
          { id: 'opt-e1-2', optionText: 'Across multiple Availability Zones in private subnets' },
          { id: 'opt-e1-3', optionText: 'On edge locations outside VPC route tables' },
          { id: 'opt-e1-4', optionText: 'Inside an unencrypted S3 storage bucket' }
        ],
        correctOptionId: 'opt-e1-2',
        explanation: 'Deploying read/standby replicas in distinct Availability Zones ensures seamless failover and redundancy.'
      },
      {
        id: 'qe-2',
        questionText: 'Which security layer acts as a stateful virtual firewall controlling traffic at the EC2 instance level?',
        options: [
          { id: 'opt-e2-1', optionText: 'Security Group' },
          { id: 'opt-e2-2', optionText: 'Network Access Control List (NACL)' },
          { id: 'opt-e2-3', optionText: 'AWS Shield Standard' },
          { id: 'opt-e2-4', optionText: 'Internet Gateway Route Policy' }
        ],
        correctOptionId: 'opt-e2-1',
        explanation: 'Security Groups are stateful firewalls operating at the instance interface level, whereas Network ACLs are stateless at subnet boundaries.'
      },
      {
        id: 'qe-3',
        questionText: 'What mechanism allows an Auto Scaling Group to dynamically scale compute instances based on changing CPU utilization thresholds?',
        options: [
          { id: 'opt-e3-1', optionText: 'CloudWatch Alarms with Dynamic Target Tracking Scaling Policies' },
          { id: 'opt-e3-2', optionText: 'Manual SSH cron scripts on the bastion host' },
          { id: 'opt-e3-3', optionText: 'DNS round-robin TTL adjustments in Route 53' },
          { id: 'opt-e3-4', optionText: 'Direct Connect failover routers' }
        ],
        correctOptionId: 'opt-e3-1',
        explanation: 'Target tracking and dynamic scaling policies trigger alarms in CloudWatch to add or remove EC2 instances automatically.'
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

            const allLessonsList = data.sections.flatMap(s => s.lessons);
            let targetLesson = null;
            if (activeCourse?.targetLessonId) {
              targetLesson = allLessonsList.find(l => l.id === activeCourse.targetLessonId);
            }
            if (!targetLesson) {
              const firstIncomplete = allLessonsList.find(l => !l.isCompleted);
              targetLesson = firstIncomplete || allLessonsList[0];
            }

            if (targetLesson) {
              setActiveLesson(targetLesson);
              loadQuizForLesson(targetLesson.id, targetLesson);
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

  // All lessons in sequential order for progress & locking
  const allLessons = courseContent?.sections?.flatMap(s => s.lessons) || [];
  const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const currentProgressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Resolve current user & progression gating permissions
  const resolvedUser = currentUser || api.auth.getCurrentUser();
  const userEmail = (resolvedUser?.email || '').toLowerCase().trim();
  const authorEmail = (courseContent?.instructorEmail || activeCourse?.instructorEmail || '').toLowerCase().trim();
  const currentUserId = (resolvedUser?.id || '').toString().toLowerCase().trim();
  const authorId = (courseContent?.instructorId || activeCourse?.instructorId || '').toString().toLowerCase().trim();
  const userFullName = (resolvedUser?.fullName || '').toLowerCase().trim();
  const authorName = (courseContent?.instructorName || activeCourse?.instructorName || '').toLowerCase().trim();

  // Only the actual creator/instructor of THIS specific course or an Admin has author bypass
  const isCourseAuthor = Boolean(
    resolvedUser && (
      (authorId && currentUserId && authorId === currentUserId) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (!authorId && !authorEmail && authorName && userFullName && authorName === userFullName)
    )
  );

  const isAdmin = resolvedUser?.role === 'Admin';
  const isAuthorOrAdmin = isCourseAuthor || isAdmin;

  // Check if an entire module/section is unlocked for the student
  const isSectionUnlocked = (sectionIndex) => {
    if (isAuthorOrAdmin) return true; // Instructors & Admins preview all modules
    if (sectionIndex <= 0) return true; // First module is always open

    const sections = courseContent?.sections || [];
    for (let i = 0; i < sectionIndex; i++) {
      const prevSec = sections[i];
      if (!prevSec || !prevSec.lessons || prevSec.lessons.length === 0) continue;

      // 1. All lessons in preceding module must be completed
      const allPrevLessonsCompleted = prevSec.lessons.every(l => completedLessonIds.has(l.id));
      if (!allPrevLessonsCompleted) return false;

      // 2. Any quiz / exam in preceding module must be passed
      const quizLessons = prevSec.lessons.filter(l => l.lessonType === 'Quiz' || l.hasQuiz || l.quiz);
      for (const ql of quizLessons) {
        if (!completedLessonIds.has(ql.id) && !passedQuizIds.has(ql.id)) {
          return false;
        }
      }
    }
    return true;
  };

  // Check if a specific lesson is unlocked for the current student
  const isLessonUnlocked = (lessonId) => {
    if (isAuthorOrAdmin) return true; // Instructors & Admins have full author preview access
    const sections = courseContent?.sections || [];
    const secIdx = sections.findIndex(s => s.lessons?.some(l => l.id === lessonId));

    // If section is locked, all its lessons are strictly locked
    if (secIdx > 0 && !isSectionUnlocked(secIdx)) {
      return false;
    }

    // Within unlocked section, sequential progression applies:
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true; // First lesson is always unlocked
    const previousLesson = allLessons[idx - 1];
    return completedLessonIds.has(previousLesson?.id);
  };

  const isCurrentLessonLocked = activeLesson ? !isLessonUnlocked(activeLesson.id) : false;

  // Cooldown timer ticker
  useEffect(() => {
    if (cooldownRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemainingSeconds]);

  // Load Quiz when lesson changes
  const loadQuizForLesson = async (lessonId, lessonObj = null) => {
    setSelectedAnswers({});
    setQuizResult(null);
    setIsExamStarted(false);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((lessonObj?.durationMinutes || 20) * 60);

    // Check localStorage for active 1-hour cooldown
    const cooldownKey = getCooldownStorageKey(lessonId);
    const savedCooldown = localStorage.getItem(cooldownKey);
    if (savedCooldown) {
      const diff = Math.max(0, Math.floor((parseInt(savedCooldown, 10) - Date.now()) / 1000));
      setCooldownRemainingSeconds(diff);
    } else {
      setCooldownRemainingSeconds(0);
    }

    // If lesson has embedded quiz
    if (lessonObj?.quiz && lessonObj.quiz.questions && lessonObj.quiz.questions.length > 0) {
      setQuizData(randomizeQuizOptions(lessonObj.quiz));
      return;
    }

    try {
      const q = await api.quizzes.getByLesson(lessonId);
      if (q && q.questions && q.questions.length > 0) {
        setQuizData(randomizeQuizOptions(q));
        return;
      }
    } catch (e) {
      console.warn('API quiz fetch note:', e.message);
    }

    // Use fallback quizzes
    const isExam = lessonObj?.title?.toLowerCase().includes('exam') || lessonId === 'les-exam-1';
    if (isExam) {
      setQuizData(randomizeQuizOptions(fallbackExamQuiz));
    } else if (lessonId === 'les-1' || !activeCourse?.id || activeCourse?.id === 'demo') {
      setQuizData(randomizeQuizOptions(fallbackQuiz));
    } else {
      setQuizData(null);
    }
  };

  const handleLessonSwitch = (lesson) => {
    const sections = courseContent?.sections || [];
    const secIdx = sections.findIndex(s => s.lessons?.some(l => l.id === lesson.id));

    if (secIdx > 0 && !isSectionUnlocked(secIdx)) {
      const prevSec = sections[secIdx - 1];
      setSuccessNotice(`🔒 ეს მოდული ჩაკეტილია! შემდეგ მოდულზე გადასასვლელად ჯერ წარმატებით უნდა ჩააბაროთ წინა მოდულის ("${prevSec?.title || 'Module'}") ფინალური გამოცდა (მინიმუმ 70%).`);
      setTimeout(() => setSuccessNotice(''), 5500);
      return;
    }

    if (!isLessonUnlocked(lesson.id)) {
      const idx = allLessons.findIndex(l => l.id === lesson.id);
      const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
      setSuccessNotice(`🔒 გთხოვთ გაიაროთ წინა გაკვეთილი ("${prevLesson?.title || 'Preceding lesson'}"), რათა გაიხსნას ეს მასალა.`);
      setTimeout(() => setSuccessNotice(''), 4500);
      return;
    }

    setActiveLesson(lesson);
    setIsPlaying(false);
    setCurrentVideoTime(0);

    // Reset proctoring state for fresh attempt
    setIsExamStarted(false);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((lesson.durationMinutes || 20) * 60);

    // If student clicks a Quiz item in the syllabus, automatically open the Quiz tab!
    if (lesson.lessonType === 'Quiz') {
      setActiveTab('quiz');
    }

    loadQuizForLesson(lesson.id, lesson);
  };

  // Start Exam explicitly when student clicks "გამოცდის დაწყება"
  const handleStartExam = () => {
    if (cooldownRemainingSeconds > 0) return;
    setIsExamStarted(true);
    setSelectedAnswers({});
    setQuizResult(null);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((activeLesson?.durationMinutes || 20) * 60);
    if (quizData) {
      setQuizData(randomizeQuizOptions(quizData));
    }
  };

  // Reset Cooldown for testing / instructor bypass
  const handleResetCooldown = () => {
    if (activeLesson) {
      const cooldownKey = getCooldownStorageKey(activeLesson.id);
      localStorage.removeItem(cooldownKey);
    }
    setCooldownRemainingSeconds(0);
    setIsExamStarted(false);
    setSelectedAnswers({});
    setQuizResult(null);
    setExamStrikes(0);
    setExamTerminated(false);
    setSuccessNotice('საგამოცდო ტაიმერი განულებულია.');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  // 1. Anti-Cheating: Tab Switching & Window Blur Monitoring
  useEffect(() => {
    if (activeTab !== 'quiz' || !isExamStarted || quizResult || examTerminated || !quizData?.questions?.length || cooldownRemainingSeconds > 0) return;

    let debounceTimeout = null;

    const handleInfraction = () => {
      if (debounceTimeout) return;
      debounceTimeout = setTimeout(() => { debounceTimeout = null; }, 1200);

      setExamStrikes(prev => {
        const nextStrikes = prev + 1;
        if (nextStrikes >= 3) {
          setExamTerminated(true);
          setIsExamStarted(false);

          // 1 hour lockout on disqualification
          if (activeLesson) {
            const cooldownKey = getCooldownStorageKey(activeLesson.id);
            const oneHourSeconds = 60 * 60;
            const unlockTimestamp = Date.now() + oneHourSeconds * 1000;
            localStorage.setItem(cooldownKey, unlockTimestamp.toString());
            setCooldownRemainingSeconds(oneHourSeconds);
          }

          setStrikeModal({
            isOpen: true,
            strikes: 3,
            message: '❌ გამოცდა გაუქმებულია: დაფიქსირდა 3 დარღვევა (ჩანართის ან ფანჯრის დატოვება). თქვენ ვერ ჩააბარეთ მოდულის გამოცდა. შემდეგი ცდა შესაძლებელი იქნება 1 საათის შემდეგ.'
          });
          setQuizResult({
            totalQuestions: quizData?.questions?.length || 0,
            correctAnswersCount: 0,
            scorePercentage: 0,
            passed: false,
            feedbackMessage: '❌ გამოცდა გაუქმებულია საგამოცდო წესების 3-ჯერ დარღვევის გამო (ჩანართის/ბრაუზერის დატოვება). შემდეგი ცდა ხელმისაწვდომი იქნება 1 საათის შემდეგ.'
          });
          return 3;
        } else {
          setStrikeModal({
            isOpen: true,
            strikes: nextStrikes,
            message: nextStrikes === 1
              ? '⚠️ საგამოცდო წესების დარღვევა! ბრაუზერის ჩანართის დატოვება ან სხვა ფანჯარაზე გადასვლა კატეგორიულად აკრძალულია. დაფიქსირდა გაფრთხილება: 1 / 3. მე-3 დარღვევაზე გამოცდა ავტომატურად გაუქმდება!'
              : '🚨 კრიტიკული გაფრთხილება! თქვენ მეორედ დატოვეთ საგამოცდო გვერდი. დაფიქსირდა გაფრთხილება: 2 / 3. შემდეგი დარღვევისთანავე თქვენი გამოცდა დაუყოვნებლივ გაუქმდება და ჩაგეთვლებათ ჩაჭრილად!'
          });
          return nextStrikes;
        }
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleInfraction();
      }
    };

    const onWindowBlur = () => {
      handleInfraction();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [activeTab, isExamStarted, quizResult, examTerminated, quizData, cooldownRemainingSeconds]);

  // 2. Anti-Cheating: Keyboard Shortcut Interception
  useEffect(() => {
    if (activeTab !== 'quiz' || !isExamStarted || quizResult || !quizData?.questions?.length || cooldownRemainingSeconds > 0) return;

    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        (isCtrlOrCmd && ['c', 'v', 'x', 'a', 'u', 's', 'p'].includes(key)) ||
        e.key === 'F12' ||
        (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerProctorToast('🚫 საგამოცდო სისტემა ბლოკავს კლავიატურის ამ კომბინაციას (კოპირება/ჩასმა/ინსპექტირება)');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeTab, isExamStarted, quizResult, quizData, cooldownRemainingSeconds]);

  // 3. Anti-Cheating: Countdown Timer
  useEffect(() => {
    if (activeTab !== 'quiz' || !isExamStarted || quizResult || examTerminated || !quizData?.questions?.length || cooldownRemainingSeconds > 0) return;

    const timer = setInterval(() => {
      setExamTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          triggerProctorToast('⏱️ საგამოცდო დრო ამოიწურა! პასუხები ავტომატურად გაიგზავნა შესაფასებლად.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, isExamStarted, quizResult, examTerminated, quizData, cooldownRemainingSeconds]);

  // Fullscreen exam toggle
  const toggleFullscreenExam = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreenExam(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreenExam(false);
        }).catch(() => {});
      }
    }
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
    if (quizResult || examTerminated) return; // Prevent changing after submission/disqualification
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
      let res = null;
      try {
        res = await api.quizzes.submit(quizData.id, selectedAnswers);
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

        res = {
          totalQuestions: questions.length,
          correctAnswersCount: correct,
          scorePercentage: pct,
          passed,
          feedbackMessage: passed
            ? `🎉 გილოცავთ! თქვენ წარმატებით ჩააბარეთ გამოცდა ${pct}%-ით!`
            : `თქვენი შედეგია ${pct}%. გამსვლელი ქულაა ${quizData.passingScorePercentage || 70}%. გაიმეორეთ მასალა და სცადეთ ხელახლა!`,
          questionFeedbacks: feedbacks
        };
      }

      setQuizResult(res);

      if (res && res.passed) {
        setPassedQuizIds(prev => new Set(prev).add(activeLesson.id));
        setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));

        // Clear any previous cooldown
        if (activeLesson) {
          const cooldownKey = getCooldownStorageKey(activeLesson.id);
          localStorage.removeItem(cooldownKey);
          setCooldownRemainingSeconds(0);
        }

        const sections = courseContent?.sections || [];
        const currentSecIdx = sections.findIndex(s => s.lessons?.some(l => l.id === activeLesson.id));
        const nextSec = currentSecIdx >= 0 && currentSecIdx < sections.length - 1 ? sections[currentSecIdx + 1] : null;

        if (nextSec) {
          setModuleUnlockNotice({
            currentModuleTitle: sections[currentSecIdx]?.title || `Module ${currentSecIdx + 1}`,
            nextModuleTitle: nextSec.title,
            nextLesson: nextSec.lessons?.[0],
            score: res.scorePercentage
          });
        }

        setSuccessNotice(`🎉 გამოცდა წარმატებით ჩაბარებულია (${res.scorePercentage}%)! ${nextSec ? 'შემდეგი მოდული განბლოკილია!' : 'კურსი წარმატებით დასრულდა!'}`);
        setTimeout(() => setSuccessNotice(''), 6000);
      } else {
        // Failed: apply 1 hour cooldown lockout as requested by user
        if (activeLesson) {
          const cooldownKey = getCooldownStorageKey(activeLesson.id);
          const oneHourSeconds = 60 * 60;
          const unlockTimestamp = Date.now() + oneHourSeconds * 1000;
          localStorage.setItem(cooldownKey, unlockTimestamp.toString());
          setCooldownRemainingSeconds(oneHourSeconds);
        }
        setIsExamStarted(false);
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Retake quiz after failure or disqualification
  const handleRetakeQuiz = () => {
    if (cooldownRemainingSeconds > 0) {
      triggerProctorToast(`⏳ შემდეგი ცდა შესაძლებელი იქნება ${formatCooldownTime(cooldownRemainingSeconds)}-ში`);
      return;
    }
    setIsExamStarted(false);
    setSelectedAnswers({});
    setQuizResult(null);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((activeLesson?.durationMinutes || 20) * 60);
    if (quizData) {
      setQuizData(randomizeQuizOptions(quizData));
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
          
          {/* Video Container with Bunny Stream Player or Locked Barrier */}
          <div className="relative rounded-[24px] overflow-hidden bg-black shadow-2xl aspect-video flex items-center justify-center border border-slate-800">
            {(() => {
              const activeSecIdx = courseContent?.sections?.findIndex(s => s.lessons?.some(l => l.id === activeLesson?.id)) ?? -1;
              const isCurrentSectionLocked = activeSecIdx > 0 && !isSectionUnlocked(activeSecIdx);
              const prevSection = activeSecIdx > 0 ? courseContent?.sections?.[activeSecIdx - 1] : null;
              const prevSectionExam = prevSection?.lessons?.slice().reverse().find(l => l.lessonType === 'Quiz' || l.hasQuiz || l.title?.toLowerCase().includes('exam') || l.title?.toLowerCase().includes('quiz'));

              if (isCurrentSectionLocked) {
                return (
                  <div className="text-center p-8 space-y-4 max-w-lg animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-xl animate-pulse">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider inline-block">
                        🔒 მოდული ჩაკეტილია (Module Locked)
                      </span>
                      <h3 className="font-bold text-xl text-white">
                        {courseContent?.sections?.[activeSecIdx]?.title || 'Module Locked'}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                        შემდეგ მოდულზე წვდომის მისაღებად აუცილებელია წინა მოდულის ("{prevSection?.title || 'Preceding Module'}") ყველა გაკვეთილის გავლა და ფინალური გამოცდის ჩაბარება (მინიმუმ 70%).
                      </p>
                    </div>
                    {prevSectionExam && (
                      <button
                        onClick={() => handleLessonSwitch(prevSectionExam)}
                        className="px-6 py-3 rounded-full bg-totc-teal text-white hover:bg-totc-teal-dark font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2 mt-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>გადადით წინა მოდულის ფინალურ გამოცდაზე</span>
                      </button>
                    )}
                  </div>
                );
              }

              if (isCurrentLessonLocked) {
                return (
                  <div className="text-center p-8 space-y-4 max-w-md animate-in fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto shadow-lg">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-white">Lecture Locked</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        თქვენ ჯერ არ გაგივლიათ წინა ლექცია. წინა მასალების (ვიდეო, ქვიზი) გავლის შემდეგ ეს გაკვეთილი გაიხსნება.
                      </p>
                    </div>
                    {allLessons.findIndex(l => l.id === activeLesson?.id) > 0 && (
                      <button
                        onClick={() => {
                          const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
                          handleLessonSwitch(allLessons[idx - 1]);
                        }}
                        className="px-5 py-2.5 rounded-full bg-totc-teal text-white hover:bg-totc-teal-dark font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Go to Previous Incomplete Lecture</span>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <BunnyPlayer
                  key={activeLesson?.id || activeLesson?.videoUrl || 'no-lesson'}
                  src={activeLesson?.videoUrl}
                  title={activeLesson?.title}
                  moduleTitle={courseContent?.sections?.find(s => s.lessons?.some(l => l.id === activeLesson?.id))?.title}
                  onTimeUpdate={(seconds) => setCurrentVideoTime(seconds)}
                  onEnded={() => {
                    if (activeLesson?.id && !completedLessonIds.has(activeLesson.id)) {
                      handleCompleteCurrentLesson();
                    }
                  }}
                />
              );
            })()}
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

          {/* Celebratory Module Unlocked Banner */}
          {moduleUnlockNotice && (
            <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/50 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>🎉 გილოცავთ! თქვენ წარმატებით ჩააბარეთ მოდულის ფინალური გამოცდა ({moduleUnlockNotice.score}%)</span>
                  </h4>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    {moduleUnlockNotice.currentModuleTitle} დასრულებულია. შემდეგი მოდული (<strong>{moduleUnlockNotice.nextModuleTitle}</strong>) განბლოკილია!
                  </p>
                </div>
              </div>
              {moduleUnlockNotice.nextLesson && (
                <button
                  onClick={() => {
                    handleLessonSwitch(moduleUnlockNotice.nextLesson);
                    setModuleUnlockNotice(null);
                  }}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
                >
                  <span>გადადით შემდეგ მოდულზე</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

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
                { 
                  id: 'quiz', 
                  label: 'Knowledge Check Quiz', 
                  icon: HelpCircle, 
                  badge: (quizData?.questions?.length || activeLesson?.quiz?.questions?.length || (activeLesson?.hasQuiz ? 1 : 0)) || null 
                },
                { 
                  id: 'resources', 
                  label: 'Resources & Code', 
                  icon: Download, 
                  badge: activeLesson?.resources?.length > 0 
                    ? `${activeLesson.resources.length} files` 
                    : (activeLesson?.id === 'les-1' ? '2 files' : null) 
                },
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

            {/* If current lesson is locked: show locked barrier instead of tab content */}
            {isCurrentLessonLocked ? (
              <div className="p-10 text-center bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-white">Lesson Materials & Quiz Locked</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  ამ ლექციის ქვიზზე, გადმოსაწერ რესურსებსა და მასალებზე წვდომა შეზღუდულია, სანამ წინა ლექციას არ გაივლით და არ მონიშნავთ დასრულებულად.
                </p>
              </div>
            ) : (
              <>
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

                {/* TAB 2: INTERACTIVE QUIZ & PROCTORED EXAMINATION */}
                {activeTab === 'quiz' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {(!quizData || !quizData.questions || quizData.questions.length === 0) ? (
                      <div className="p-8 text-center bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
                        <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                        <h4 className="font-bold text-sm text-white">No Quiz for this Lecture</h4>
                        <p className="text-xs text-slate-400">
                          ლექტორს ამ ლექციისთვის ქვიზი ჯერ არ დაუმატებია.
                        </p>
                      </div>
                    ) : cooldownRemainingSeconds > 0 && !quizResult?.passed ? (
                      /* VIEW 1: COOLDOWN LOCKOUT SCREEN (1-Hour Retake Delay) */
                      <div className="p-6 md:p-9 bg-gradient-to-b from-slate-900 to-slate-850 rounded-3xl border border-amber-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                          <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                          <span>⏳ საგამოცდო პაუზა (Cool-down Period)</span>
                        </div>

                        <div className="space-y-2 max-w-xl mx-auto">
                          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            შემდეგი ცდა დროებით შეზღუდულია
                          </h3>
                          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                            {quizResult
                              ? `თქვენი ბოლო შედეგია ${quizResult.scorePercentage}% (გამსვლელი ბარიერი: ${quizData.passingScorePercentage || 70}%). საგამოცდო რეგულაციით, წარუმატებელი ცდის ან დისკვალიფიკაციის შემდეგ დაწესებულია 1-საათიანი მოსამზადებელი პაუზა.`
                              : 'საგამოცდო წესების დარღვევის ან წარუმატებელი ცდის გამო, შემდეგი მცდელობა ხელმისაწვდომი იქნება ქვემოთ მითითებული დროის ამოწურვის შემდეგ.'}
                          </p>
                        </div>

                        {/* Live Countdown Display Widget */}
                        <div className="p-6 md:p-8 bg-slate-950/80 rounded-2xl border border-amber-500/30 max-w-md mx-auto shadow-inner space-y-2">
                          <p className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                            ⏱️ დარჩენილი დრო შემდეგ ცდამდე
                          </p>
                          <div className="text-4xl md:text-5xl font-mono font-black text-amber-300 tracking-wider">
                            {formatCooldownTime(cooldownRemainingSeconds)}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            დროის ამოწურვის შემდეგ ავტომატურად გაიხსნება გამოცდის ხელახალი ცდა
                          </p>
                        </div>

                        {/* Advice Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-totc-teal" />
                              <span>გადახედეთ მასალებს</span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              გამოიყენეთ ეს დრო ვიდეო ლექციებისა და რესურსების გასამეორებლად.
                            </p>
                          </div>
                          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              <span>მოდულის გახსნა</span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              მინიმუმ {quizData.passingScorePercentage || 70}%-ის დაგროვება ხსნის შემდეგ მოდულს.
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                          <button
                            onClick={() => setActiveTab('overview')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>📖 მასალების გადამეორება (Overview)</span>
                          </button>

                          <button
                            onClick={handleResetCooldown}
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                            title="ტესტირებისთვის ტაიმერის დაუყოვნებლივ განულება"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>⚡ ტაიმერის განულება (ტესტირებისთვის)</span>
                          </button>
                        </div>
                      </div>
                    ) : !isExamStarted && (!quizResult || !quizResult.passed) ? (
                      /* VIEW 2: PRE-EXAM BRIEFING & START SCREEN */
                      <div className="p-6 md:p-8 bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 animate-in fade-in duration-300">
                        {/* Briefing Top Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal border border-totc-teal/30 text-xs font-bold mb-1">
                              <Award className="w-3.5 h-3.5" />
                              <span>ოფიციალური შემაჯამებელი ტესტირება</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white">
                              {quizData?.title || `Knowledge Check: ${activeLesson?.title || 'Lecture Assessment'}`}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
                              {quizData?.description || 'შეაფასეთ თქვენი ცოდნა და მიიღეთ შემდეგ მოდულზე გადასვლის უფლება.'}
                            </p>
                          </div>

                          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400 font-medium">საგამოცდო ბარიერი:</span>
                            <span className="px-3.5 py-1.5 rounded-xl bg-totc-teal/15 text-totc-teal border border-totc-teal/30 text-xs font-black">
                              გამსვლელი: {quizData.passingScorePercentage || 70}%
                            </span>
                          </div>
                        </div>

                        {/* Examination Key Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-1">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-totc-cyan" />
                              კითხვები
                            </span>
                            <p className="text-lg font-black text-white">{quizData.questions.length} შეკითხვა</p>
                            <p className="text-[10px] text-slate-400">არჩევითი პასუხებით</p>
                          </div>

                          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-1">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-amber-400" />
                              საგამოცდო დრო
                            </span>
                            <p className="text-lg font-black text-white">{activeLesson?.durationMinutes || 20} წუთი</p>
                            <p className="text-[10px] text-slate-400">ათვლა დაიწყება სტარტზე</p>
                          </div>

                          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-1">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              მონიტორინგი
                            </span>
                            <p className="text-lg font-black text-emerald-300">პროქტორინგი</p>
                            <p className="text-[10px] text-slate-400">3 დარღვევის ლიმიტი</p>
                          </div>

                          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-1">
                            <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-indigo-400" />
                              მოდულის გახსნა
                            </span>
                            <p className="text-lg font-black text-indigo-300">ავტომატური</p>
                            <p className="text-[10px] text-slate-400">70%-ზე მეტისას</p>
                          </div>
                        </div>

                        {/* Rules and Security Regulations Box */}
                        <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-totc-cyan flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-totc-cyan" />
                            <span>საგამოცდო წესები და უსაფრთხოების რეგულაციები:</span>
                          </h4>
                          <ul className="text-xs text-slate-300 space-y-2.5 pl-1">
                            <li className="flex items-start gap-2">
                              <span className="text-totc-teal font-bold shrink-0">1.</span>
                              <span><strong>ჩანართის დატოვება აკრძალულია:</strong> გამოცდის მსვლელობისას სხვა ჩანართზე გადასვლა, ფანჯრის მინიმიზაცია ან სხვა პროგრამაზე გადართვა ფიქსირდება როგორც დარღვევა (მაქსიმუმ 3 გაფრთხილება დისკვალიფიკაციამდე).</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-totc-teal font-bold shrink-0">2.</span>
                              <span><strong>კოპირებისა და კონტექსტური მენიუს ბლოკირება:</strong> ტექსტის მონიშვნა, კოპირება (Ctrl+C), ჩასმა (Ctrl+V) და დეველოპერის პანელი (F12) ავტომატურად დაბლოკილია.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-totc-teal font-bold shrink-0">3.</span>
                              <span><strong>1-საათიანი ლიმიტი წარუმატებლობის შემთხვევაში:</strong> თუ ვერ გადალახავთ {quizData.passingScorePercentage || 70}%-იან ბარიერს, შემდეგი ცდა ხელმისაწვდომი იქნება ზუსტად 1 საათის შემდეგ.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-totc-teal font-bold shrink-0">4.</span>
                              <span><strong>დროის ათვლა:</strong> ტაიმერი დაიწყებს ათვლას მხოლოდ მას შემდეგ, რაც დააჭერთ ღილაკს <strong>„გამოცდის დაწყება“</strong>.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Start Button Area */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-xs text-slate-400">
                            დარწმუნდით, რომ გაქვთ მყარი ინტერნეტ კავშირი და მზად ხართ საგამოცდო პროცესისთვის.
                          </div>

                          <button
                            onClick={handleStartExam}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-totc-teal to-emerald-500 hover:from-totc-teal-dark hover:to-emerald-600 text-white font-black text-sm shadow-xl shadow-totc-teal/25 hover:shadow-totc-teal/40 transition-all flex items-center justify-center gap-2.5 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>🚀 გამოცდის დაწყება (Start Examination)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* VIEW 3 & 4: ACTIVE EXAM OR PASSED RESULT SCREEN */
                      <>
                        {/* PROCTORING INTEGRITY HEADER BAR */}
                        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700/80 space-y-3 shadow-lg">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Live Proctor Shield & Strikes Badge */}
                            <div className="flex items-center gap-2.5">
                              <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold border transition-colors ${
                                examStrikes === 0
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : examStrikes === 1
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : examStrikes === 2
                                  ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/40'
                              }`}>
                                {examStrikes === 0 ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                                )}
                                <span>
                                  {examStrikes === 0
                                    ? '🛡️ საგამოცდო კონტროლი: აქტიური (დარღვევები: 0/3)'
                                    : examStrikes === 1
                                    ? '⚠️ გაფრთხილება: 1 / 3'
                                    : examStrikes === 2
                                    ? '🚨 კრიტიკული გაფრთხილება: 2 / 3'
                                    : '❌ დისკვალიფიცირებული (3/3)'}
                                </span>
                              </div>

                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>ჩანართის დატოვება და გადაწერა აკრძალულია</span>
                              </span>
                            </div>

                            {/* Live Countdown Timer & Fullscreen */}
                            <div className="flex items-center gap-2.5">
                              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${
                                examTimerSeconds <= 120
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                                  : 'bg-slate-800 text-slate-200 border-slate-700'
                              }`}>
                                <Timer className="w-4 h-4 text-totc-teal" />
                                <span>⏱️ {formatExamTime(examTimerSeconds)}</span>
                              </div>

                              <button
                                onClick={toggleFullscreenExam}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5"
                                title="სრულ ეკრანზე გაშლა"
                              >
                                {isFullscreenExam ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                <span className="hidden md:inline">{isFullscreenExam ? 'ფანჯარა' : 'სრული ეკრანი'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Proctoring Alert Toast */}
                          {proctorToast && (
                            <div className="p-2.5 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                              <span>{proctorToast}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
                          <div>
                            <h3 className="font-bold text-lg text-white">
                              {quizData?.title || `Knowledge Check: ${activeLesson?.title || 'Lecture Assessment'}`}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {quizData?.description || 'Answer the questions below to test your understanding of this lecture.'}
                            </p>
                          </div>

                          {quizData && (
                            <div className="px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal text-xs font-bold shrink-0">
                              Passing: {quizData.passingScorePercentage || 70}%
                            </div>
                          )}
                        </div>

                        {/* Questions List with Anti-Copy & Anti-Selection Protection */}
                        <div 
                          className="space-y-6 select-none"
                          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            triggerProctorToast('🚫 მარჯვენა ღილაკის კონტექსტური მენიუ დაბლოკილია საგამოცდო რეჟიმში');
                          }}
                          onCopy={(e) => {
                            e.preventDefault();
                            triggerProctorToast('🚫 ტექსტის კოპირება დაბლოკილია საგამოცდო რეჟიმში');
                          }}
                          onCut={(e) => {
                            e.preventDefault();
                            triggerProctorToast('🚫 ამოჭრა დაბლოკილია');
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            triggerProctorToast('🚫 ჩასმა დაბლოკილია');
                          }}
                        >
                          {quizData.questions.map((q, qIndex) => {
                            const selectedOptId = selectedAnswers[q.id];
                            const feedback = quizResult?.questionFeedbacks?.find(f => f.questionId === q.id);

                            return (
                              <div
                                key={q.id || qIndex}
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
                                        disabled={quizResult !== null || examTerminated}
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
                                onClick={handleRetakeQuiz}
                                className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retake Quiz (ხელახლა ცდა)</span>
                              </button>
                            ) : (
                              <button
                                onClick={handleSubmitQuiz}
                                disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < (quizData?.questions?.length || 1) || examTerminated}
                                className={`px-8 py-3 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                                  Object.keys(selectedAnswers).length >= (quizData?.questions?.length || 1) && !examTerminated
                                    ? 'bg-totc-teal text-white hover:bg-totc-teal-dark'
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {isSubmittingQuiz ? 'Grading...' : 'Check My Answers'}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 3: RESOURCES & CODE */}
                {activeTab === 'resources' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="pb-2 border-b border-slate-700">
                      <h4 className="font-bold text-base text-white">Downloadable Assets & Source Code</h4>
                      <p className="text-xs text-slate-400">
                        All configuration code, attachments, guides, and slides uploaded for this lecture.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {((activeLesson?.resources && activeLesson.resources.length > 0)
                        ? activeLesson.resources
                        : (activeLesson?.id === 'les-1' ? [
                            {
                              name: 'aws_vpc_multi_az_starter_template.zip',
                              desc: 'Terraform and CloudFormation starter templates with public/private subnet declarations.',
                              size: '4.8 MB',
                              type: 'Source Code',
                              fileUrl: '#'
                            },
                            {
                              name: 'cloud_architect_lecture_slides_module1.pdf',
                              desc: 'Full high-res presentation slides and architectural decision rubrics.',
                              size: '12.4 MB',
                              type: 'Slides',
                              fileUrl: '#'
                            }
                          ] : [])
                      ).map((res, i) => {
                        const isCode = res.type?.toLowerCase().includes('code') || res.name?.match(/\.(js|jsx|ts|tsx|py|cs|html|css|json)$/i);
                        const isZip = res.type?.toLowerCase().includes('zip') || res.type?.toLowerCase().includes('archive') || res.name?.match(/\.(zip|rar|tar|gz|7z)$/i);

                        return (
                          <div
                            key={res.id || i}
                            className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-totc-teal/50 transition-colors"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-totc-teal/15 text-totc-teal flex items-center justify-center shrink-0 mt-0.5">
                                {isCode ? (
                                  <Code className="w-5 h-5" />
                                ) : isZip ? (
                                  <FolderArchive className="w-5 h-5" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate">{res.name}</p>
                                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{res.desc || res.description || 'Downloadable lecture attachment'}</p>
                                <span className="inline-block mt-1 text-[10px] font-semibold text-totc-cyan">
                                  {res.type || 'File'} • {res.size || res.fileSize || 'Attachment'}
                                </span>
                              </div>
                            </div>

                            {res.fileUrl && res.fileUrl !== '#' ? (
                              <a
                                href={resolveVideoUrl(res.fileUrl)}
                                download={res.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-totc-teal hover:text-white text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download File</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => alert(`Downloading: ${res.name}`)}
                                className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-totc-teal hover:text-white text-xs font-bold text-slate-200 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {(!activeLesson?.resources || activeLesson.resources.length === 0) && activeLesson?.id !== 'les-1' && (
                        <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-2">
                          <Download className="w-8 h-8 text-slate-500 mx-auto" />
                          <h4 className="font-bold text-sm text-white">No Attached Files</h4>
                          <p className="text-xs text-slate-400">
                            ამ ლექციისთვის გადმოსაწერი ფაილები ან კოდი ჯერ არ არის ატვირთული.
                          </p>
                        </div>
                      )}
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
              </>
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
            {courseContent?.sections?.map((section, sIdx) => {
              const isSecUnlocked = isSectionUnlocked(sIdx);
              const prevSec = sIdx > 0 ? courseContent?.sections?.[sIdx - 1] : null;

              return (
                <div
                  key={section.id || sIdx}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    !isSecUnlocked
                      ? 'bg-slate-900/90 border-slate-700/40 opacity-75'
                      : 'bg-slate-800/80 border-slate-700/60'
                  }`}
                >
                  <div className={`p-3.5 border-b flex items-center justify-between ${
                    !isSecUnlocked
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-slate-800 border-slate-700/60'
                  }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      {!isSecUnlocked ? (
                        <span className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-200 block truncate">{section.title}</span>
                        {!isSecUnlocked && (
                          <span className="text-[10px] text-amber-400 font-semibold block">
                            🔒 ჩაკეტილია (ჩააბარეთ {prevSec?.title?.split(':')[0] || 'წინა მოდულის'} გამოცდა)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {section.lessons?.length || 0} items
                    </span>
                  </div>

                  <div className="divide-y divide-slate-700/40">
                    {section.lessons?.map((lesson, lIdx) => {
                      const isCurrent = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.has(lesson.id);
                      const isUnlocked = isLessonUnlocked(lesson.id);
                      const type = lesson.lessonType || 'Video';

                      return (
                        <button
                          key={lesson.id || lIdx}
                          onClick={() => handleLessonSwitch(lesson)}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                            !isUnlocked
                              ? 'opacity-60 cursor-not-allowed hover:bg-transparent'
                              : isCurrent
                              ? 'bg-totc-teal/15 text-white font-medium border-l-4 border-totc-teal'
                              : 'hover:bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {/* Type Icon & Completion Indicator */}
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : !isUnlocked ? (
                              <Lock className="w-4 h-4 text-slate-500" />
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
                            <div className="flex items-center justify-between gap-1.5">
                              <p className={`text-xs line-clamp-2 ${isCurrent ? 'font-bold text-totc-cyan' : ''}`}>
                                {lesson.title}
                              </p>
                              {!isUnlocked && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-bold shrink-0 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>
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
                              {lesson.resources && lesson.resources.length > 0 && (
                                <span className="text-[10px] text-totc-cyan font-semibold flex items-center gap-0.5">
                                  <Download className="w-2.5 h-2.5" />
                                  {lesson.resources.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STRIKE WARNING & DISQUALIFICATION OVERLAY MODAL */}
      {strikeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className={`max-w-md w-full p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 text-center ${
            strikeModal.strikes >= 3
              ? 'bg-red-950/95 border-red-500/60'
              : 'bg-slate-900 border-amber-500/60'
          }`}>
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
              strikeModal.strikes >= 3
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
            }`}>
              {strikeModal.strikes >= 3 ? (
                <ShieldAlert className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white">
                {strikeModal.strikes >= 3
                  ? '❌ გამოცდა გაუქმებულია (დისკვალიფიკაცია)'
                  : `⚠️ საგამოცდო წესების დარღვევა (${strikeModal.strikes} / 3)`}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {strikeModal.message}
              </p>
            </div>

            <div className="pt-2">
              {strikeModal.strikes >= 3 ? (
                <button
                  onClick={() => {
                    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
                    handleRetakeQuiz();
                  }}
                  className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>გასაგებია (საგამოცდო პაუზაზე გადასვლა)</span>
                </button>
              ) : (
                <button
                  onClick={() => setStrikeModal({ isOpen: false, strikes: strikeModal.strikes, message: '' })}
                  className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  გასაგებია, ვაგრძელებ გამოცდას
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}