import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Award, Lock, Check, BookOpen, 
  HelpCircle, Download, MessageSquare, FileText, Sparkles, 
  Trophy, ArrowRight, Timer, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import BunnyPlayer from '../components/BunnyPlayer';
import { 
  useExamProctoring,
  LessonOverviewTab,
  LessonResourcesTab,
  LessonQaTab,
  LessonNotesTab,
  ExamEnvironmentView,
  PlayerCurriculumSidebar,
  CourseCompletionModal
} from '../components/player';

export default function CoursePlayerPage({ activeCourse, setActivePage, currentUser }) {
  const [courseContent, setCourseContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(255); // 04:15 in seconds
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'quiz', 'resources', 'qa', 'notes'
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [successNotice, setSuccessNotice] = useState('');

  // Course Completion & Certificate State
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(false);
  const [copiedCertLink, setCopiedCertLink] = useState(false);

  // Module Progression Gating State
  const [passedQuizIds, setPassedQuizIds] = useState(new Set());
  const [moduleUnlockNotice, setModuleUnlockNotice] = useState(null);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);

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

  // Resolve current user & progression gating permissions
  const resolvedUser = currentUser || api.auth.getCurrentUser();
  const userEmail = (resolvedUser?.email || '').toLowerCase().trim();
  const authorEmail = (courseContent?.instructorEmail || activeCourse?.instructorEmail || '').toLowerCase().trim();
  const currentUserId = (resolvedUser?.id || '').toString().toLowerCase().trim();
  const authorId = (courseContent?.instructorId || activeCourse?.instructorId || '').toString().toLowerCase().trim();
  const userFullName = (resolvedUser?.fullName || '').toLowerCase().trim();
  const authorName = (courseContent?.instructorName || activeCourse?.instructorName || '').toLowerCase().trim();

  // Helper to ensure local uploaded videos resolve to the backend server
  const resolveVideoUrl = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (trimmed.startsWith('/uploads/')) {
      return `http://localhost:5000${trimmed}`;
    }
    return trimmed;
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
        window.dispatchEvent(new CustomEvent('totc-lesson-completed', { detail: { lessonId: activeLesson.id } }));
        try {
          await api.learning.completeLesson(activeLesson.id, 0, true);
        } catch (e) {
          console.warn('Completed quiz lesson:', e.message);
        }

        // Clear any previous cooldown
        if (activeLesson) {
          const cooldownKey = getCooldownStorageKey(activeLesson.id);
          localStorage.removeItem(cooldownKey);
          setCooldownRemainingSeconds(0);
        }

        const sections = courseContent?.sections || [];
        const currentSecIdx = sections.findIndex(s => s.lessons?.some(l => l.id === activeLesson.id));
        const nextSec = currentSecIdx >= 0 && currentSecIdx < sections.length - 1 ? sections[currentSecIdx + 1] : null;

        const isLastLessonOverall = allLessons.length > 0 && allLessons[allLessons.length - 1]?.id === activeLesson.id;
        const newCompletedCount = completedLessonIds.has(activeLesson.id) ? completedLessonIds.size : completedLessonIds.size + 1;
        const isAllLessonsCompleted = (allLessons.length > 0 && newCompletedCount >= allLessons.length) || isLastLessonOverall;

        if (nextSec && !isAllLessonsCompleted) {
          setModuleUnlockNotice({
            currentModuleTitle: sections[currentSecIdx]?.title || `Module ${currentSecIdx + 1}`,
            nextModuleTitle: nextSec.title,
            nextLesson: nextSec.lessons?.[0],
            score: res.scorePercentage
          });
        } else {
          setModuleUnlockNotice(null);
        }

        if (isAllLessonsCompleted) {
          loadEarnedCertificate();
          setShowCompletionCelebration(true);
        }

        setSuccessNotice(`🎉 გამოცდა წარმატებით ჩაბარებულია (${res.scorePercentage}%)! ${isAllLessonsCompleted ? 'კურსი წარმატებით დასრულდა! 🎉' : 'შემდეგი ეტაპი განბლოკილია!'}`);
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

  // Exam Proctoring Hook
  const {
    examStrikes,
    setExamStrikes,
    examTerminated,
    setExamTerminated,
    strikeModal,
    setStrikeModal,
    examTimerSeconds,
    setExamTimerSeconds,
    proctorToast,
    triggerProctorToast,
    isFullscreenExam,
    toggleFullscreenExam,
    cooldownRemainingSeconds,
    setCooldownRemainingSeconds,
    getCooldownStorageKey,
    formatExamTime,
    formatCooldownTime,
  } = useExamProctoring({
    activeTab,
    isExamStarted,
    setIsExamStarted,
    quizResult,
    setQuizResult,
    quizData,
    activeLesson,
    currentUserId,
    userEmail,
    handleSubmitQuiz,
  });

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
              if (targetLesson.lessonType === 'Quiz' || !targetLesson.videoUrl || targetLesson.title?.toLowerCase().includes('exam') || targetLesson.title?.toLowerCase().includes('quiz') || targetLesson.title?.toLowerCase().includes('გამოცდა')) {
                setActiveTab('quiz');
              }
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

  // Permissions & Gating
  const isCourseAuthor = Boolean(
    resolvedUser && (
      (authorId && currentUserId && authorId === currentUserId) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (!authorId && !authorEmail && authorName && userFullName && authorName === userFullName)
    )
  );

  const isAdmin = resolvedUser?.role === 'Admin';
  const isAuthorOrAdmin = isCourseAuthor || isAdmin;

  const isOpenAccessCourse = Boolean(
    courseContent?.isOpenAccess ?? 
    activeCourse?.isOpenAccess ?? 
    false
  );

  // Check if an entire module/section is unlocked for the student
  const isSectionUnlocked = (sectionIndex) => {
    if (isAuthorOrAdmin || isOpenAccessCourse) return true;
    if (sectionIndex <= 0) return true;

    const sections = courseContent?.sections || [];
    for (let i = 0; i < sectionIndex; i++) {
      const prevSec = sections[i];
      if (!prevSec || !prevSec.lessons || prevSec.lessons.length === 0) continue;

      const allPrevLessonsCompleted = prevSec.lessons.every(l => completedLessonIds.has(l.id));
      if (!allPrevLessonsCompleted) return false;

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
    if (isAuthorOrAdmin || isOpenAccessCourse) return true;
    const sections = courseContent?.sections || [];
    const secIdx = sections.findIndex(s => s.lessons?.some(l => l.id === lessonId));

    if (secIdx > 0 && !isSectionUnlocked(secIdx)) {
      return false;
    }

    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx <= 0) return true;
    const previousLesson = allLessons[idx - 1];
    return completedLessonIds.has(previousLesson?.id);
  };

  const isCurrentLessonLocked = activeLesson ? !isLessonUnlocked(activeLesson.id) : false;
  const isCourseFullyCompleted = allLessons.length > 0 && completedCount === allLessons.length;

  // Fetch or issue certificate for this course
  const loadEarnedCertificate = async () => {
    const courseId = activeCourse?.id || courseContent?.id;
    if (!courseId) return null;

    setIsLoadingCertificate(true);
    try {
      const cert = await api.certificates.getByCourse(courseId);
      if (cert) {
        setEarnedCertificate(cert);
        return cert;
      }
    } catch {
      try {
        const claimed = await api.certificates.claim(courseId);
        if (claimed) {
          setEarnedCertificate(claimed);
          return claimed;
        }
      } catch (err) {
        console.warn('Could not claim certificate from server:', err?.message);
      }
    } finally {
      setIsLoadingCertificate(false);
    }

    const fallbackCert = {
      certificateNumber: `TOTC-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      studentName: resolvedUser?.fullName || 'Gloria Rose',
      courseTitle: courseContent?.title || activeCourse?.title || 'AWS Certified Solutions Architect & Cloud Operations',
      instructorName: courseContent?.instructorName || activeCourse?.instructorName || 'Lina Wilson',
      issuedAt: new Date().toISOString(),
      verificationHash: (Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18)).toLowerCase(),
      verificationUrl: `/verify/certificate/TOTC-2026`
    };
    setEarnedCertificate(fallbackCert);
    return fallbackCert;
  };

  // Auto-fetch certificate once 100% completed
  useEffect(() => {
    if (isCourseFullyCompleted && !earnedCertificate) {
      loadEarnedCertificate();
    }
  }, [isCourseFullyCompleted]);

  // Global listener from other pages (e.g. Student Dashboard)
  useEffect(() => {
    const handleOpenCertEvent = () => {
      loadEarnedCertificate();
      setShowCompletionCelebration(true);
    };
    window.addEventListener('totc-open-certificate', handleOpenCertEvent);
    return () => window.removeEventListener('totc-open-certificate', handleOpenCertEvent);
  }, [courseContent, activeCourse]);

  const handleDownloadPdf = () => {
    if (earnedCertificate?.certificateNumber) {
      window.open(`http://localhost:5000/api/certificates/${earnedCertificate.certificateNumber}/download`, '_blank');
    } else {
      window.print();
    }
  };

  const handleCopyCertLink = () => {
    const num = earnedCertificate?.certificateNumber || earnedCertificate?.verificationHash || 'TOTC-2026-ARCH';
    const url = `${window.location.origin}/certificates/${num}`;
    navigator.clipboard.writeText(url);
    setCopiedCertLink(true);
    setTimeout(() => setCopiedCertLink(false), 3000);
  };

  // Load Quiz when lesson changes
  const loadQuizForLesson = async (lessonId, lessonObj = null) => {
    setSelectedAnswers({});
    setQuizResult(null);
    setIsExamStarted(false);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((lessonObj?.durationMinutes || 20) * 60);

    const cooldownKey = getCooldownStorageKey(lessonId);
    const savedCooldown = localStorage.getItem(cooldownKey);
    if (savedCooldown) {
      const diff = Math.max(0, Math.floor((parseInt(savedCooldown, 10) - Date.now()) / 1000));
      setCooldownRemainingSeconds(diff);
    } else {
      setCooldownRemainingSeconds(0);
    }

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

    setIsExamStarted(false);
    setExamStrikes(0);
    setExamTerminated(false);
    setStrikeModal({ isOpen: false, strikes: 0, message: '' });
    setExamTimerSeconds((lesson.durationMinutes || 20) * 60);

    if (lesson.lessonType === 'Quiz' || !lesson.videoUrl || lesson.title?.toLowerCase().includes('exam') || lesson.title?.toLowerCase().includes('quiz') || lesson.title?.toLowerCase().includes('გამოცდა')) {
      setActiveTab('quiz');
    }

    loadQuizForLesson(lesson.id, lesson);
  };

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

  const handleCompleteCurrentLesson = async () => {
    if (!activeLesson) return;

    try {
      await api.learning.completeLesson(activeLesson.id, currentVideoTime, true);
    } catch (e) {
      console.warn('Saved completion locally:', e.message);
    }

    setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
    window.dispatchEvent(new CustomEvent('totc-lesson-completed', { detail: { lessonId: activeLesson.id } }));
    setSuccessNotice('ლექცია მონიშნულია როგორც დასრულებული! 🎉');
    setTimeout(() => setSuccessNotice(''), 3500);

    const allLessonsList = courseContent?.sections?.flatMap(s => s.lessons) || [];
    const currentIndex = allLessonsList.findIndex(l => l.id === activeLesson.id);
    const newCompletedCount = completedLessonIds.has(activeLesson.id) ? completedLessonIds.size : completedLessonIds.size + 1;
    const isAllComplete = (allLessonsList.length > 0 && newCompletedCount >= allLessonsList.length) || (currentIndex === allLessonsList.length - 1);

    if (isAllComplete) {
      loadEarnedCertificate();
      setShowCompletionCelebration(true);
    } else if (currentIndex >= 0 && currentIndex < allLessonsList.length - 1) {
      handleLessonSwitch(allLessonsList[currentIndex + 1]);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    if (quizResult || examTerminated) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

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

  const activeSecIdx = courseContent?.sections?.findIndex(s => s.lessons?.some(l => l.id === activeLesson?.id)) ?? -1;
  const isCurrentSectionLocked = activeSecIdx > 0 && !isSectionUnlocked(activeSecIdx);
  const prevSection = activeSecIdx > 0 ? courseContent?.sections?.[activeSecIdx - 1] : null;
  const prevSectionExam = prevSection?.lessons?.slice().reverse().find(l => l.lessonType === 'Quiz' || l.hasQuiz || l.title?.toLowerCase().includes('exam') || l.title?.toLowerCase().includes('quiz') || l.title?.toLowerCase().includes('გამოცდა'));

  const isExamLesson = Boolean(
    activeLesson?.lessonType === 'Quiz' || 
    (!activeLesson?.videoUrl && (activeLesson?.hasQuiz || activeLesson?.quiz)) ||
    activeLesson?.title?.toLowerCase().includes('exam') ||
    activeLesson?.title?.toLowerCase().includes('quiz') ||
    activeLesson?.title?.toLowerCase().includes('გამოცდა')
  );

  return (
    <div className="pt-20 bg-[#0F172A] text-white min-h-screen flex flex-col font-poppins">
      
      {/* Top Header Bar */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActivePage('courses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-totc-teal font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>უკან</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <h1 className="font-semibold text-base sm:text-lg text-white truncate max-w-md sm:max-w-xl">
            {courseContent?.title || activeCourse?.title}
          </h1>
        </div>

        {/* Course Progress */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isCourseFullyCompleted && (
            <button
              onClick={() => {
                loadEarnedCertificate();
                setShowCompletionCelebration(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all animate-pulse shrink-0"
              title="სერტიფიკატის ნახვა და ჩამოტვირთვა"
            >
              <Award className="w-3.5 h-3.5" />
              <span>სერტიფიკატის ნახვა</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{completedCount} / {allLessons.length} დასრულებულია</span>
          </div>
          <div className="w-24 sm:w-32 h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${isCourseFullyCompleted ? 'bg-amber-400' : 'bg-totc-teal'}`}
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${isCourseFullyCompleted ? 'text-amber-400' : 'text-totc-teal'}`}>{currentProgressPercent}%</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1700px] mx-auto w-full">
        
        {/* Left Column: Player & Interactive Tabs OR Dedicated Exam Environment (8 Cols) */}
        <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col space-y-6">

          {/* Section Lock Barrier */}
          {isCurrentSectionLocked ? (
            <div className="rounded-[24px] overflow-hidden bg-slate-900 shadow-2xl p-8 lg:p-12 flex items-center justify-center border border-slate-800 text-center animate-in fade-in">
              <div className="space-y-4 max-w-lg">
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
            </div>
          ) : isCurrentLessonLocked ? (
            /* Lesson Lock Barrier */
            <div className="rounded-[24px] overflow-hidden bg-slate-900 shadow-2xl p-8 lg:p-12 flex items-center justify-center border border-slate-800 text-center animate-in fade-in">
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-white">ლექცია დაბლოკილია</h3>
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
                    <span>გადასვლა წინა ლექციაზე</span>
                  </button>
                )}
              </div>
            </div>
          ) : isExamLesson ? (
            /* Dedicated Immersive Examination Environment */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Exam Hero Banner */}
              <div className="bg-slate-900/90 rounded-3xl p-6 md:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-totc-teal/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal border border-totc-teal/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>🎓 ფინალური გამოცდა (Final Examination)</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        {courseContent?.sections?.[activeSecIdx]?.title || 'საგამოცდო მოდული'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AI პროქტორინგი ჩართულია</span>
                      </span>
                    </div>

                    <div>
                      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        {activeLesson?.title || 'საგამოცდო ტესტირება'}
                      </h1>
                      <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        {quizData?.description || 'გაიარეთ ოფიციალური შემაჯამებელი ტესტირება. მინიმუმ 70%-იანი ბარიერის დაძლევა ხსნის შემდეგ მოდულს და უზრუნველყოფს სერტიფიკატის მიღებას.'}
                      </p>
                    </div>

                    {/* Key Metrics Quick Ribbon */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>ხანგრძლივობა: <strong>{activeLesson?.durationMinutes || 20} წუთი</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                        <HelpCircle className="w-3.5 h-3.5 text-totc-cyan" />
                        <span>შეკითხვები: <strong>{quizData?.questions?.length || 3}</strong></span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ბარიერი: <strong className="text-totc-teal">{quizData?.passingScorePercentage || 70}%</strong></span>
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
                    {quizResult?.passed || completedLessonIds.has(activeLesson?.id) ? (
                      <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 shadow-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>ჩაბარებულია ({quizResult?.scorePercentage || 100}%)</span>
                      </div>
                    ) : cooldownRemainingSeconds > 0 ? (
                      <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 shadow-lg">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>საგამოცდო პაუზა</span>
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-2xl bg-totc-teal/20 text-totc-teal border border-totc-teal/40 text-xs font-bold flex items-center gap-2 shadow-lg">
                        <Sparkles className="w-4 h-4 text-totc-teal" />
                        <span>მზადაა ჩასაბარებლად</span>
                      </div>
                    )}

                    {allLessons.findIndex(l => l.id === activeLesson?.id) > 0 && (
                      <button
                        onClick={() => {
                          const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
                          handleLessonSwitch(allLessons[idx - 1]);
                        }}
                        className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>წინა ლექციაზე დაბრუნება</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Completed Celebration Banner or Module Unlocked Banner */}
              {isCourseFullyCompleted ? (
                <div className="p-5 bg-gradient-to-r from-amber-950/50 via-emerald-950/40 to-slate-900 border-2 border-amber-400/60 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                      <Trophy className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                        <span>🏆 გილოცავთ! თქვენ წარმატებით დაასრულეთ კურსი!</span>
                      </h4>
                      <p className="text-xs text-amber-200/90 mt-0.5">
                        ყველა მოდული და გამოცდა წარმატებითაა ჩაბარებული (100%). თქვენი ოფიციალური აკრედიტებული სერტიფიკატი მზადაა.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      loadEarnedCertificate();
                      setShowCompletionCelebration(true);
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all shrink-0 flex items-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>სერტიფიკატის ნახვა</span>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              ) : moduleUnlockNotice ? (
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
              ) : null}

              {successNotice && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Direct Full-Screen Focused Exam Canvas */}
              <ExamEnvironmentView
                quizData={quizData}
                cooldownRemainingSeconds={cooldownRemainingSeconds}
                formatCooldownTime={formatCooldownTime}
                quizResult={quizResult}
                activeLesson={activeLesson}
                allLessons={allLessons}
                handleLessonSwitch={handleLessonSwitch}
                setActiveTab={setActiveTab}
                isExamStarted={isExamStarted}
                handleStartExam={handleStartExam}
                examStrikes={examStrikes}
                examTimerSeconds={examTimerSeconds}
                formatExamTime={formatExamTime}
                isFullscreenExam={isFullscreenExam}
                toggleFullscreenExam={toggleFullscreenExam}
                proctorToast={proctorToast}
                triggerProctorToast={triggerProctorToast}
                selectedAnswers={selectedAnswers}
                handleSelectOption={handleSelectOption}
                examTerminated={examTerminated}
                handleSubmitQuiz={handleSubmitQuiz}
                isSubmittingQuiz={isSubmittingQuiz}
                handleRetakeQuiz={handleRetakeQuiz}
                courseContent={courseContent}
                loadEarnedCertificate={loadEarnedCertificate}
                setShowCompletionCelebration={setShowCompletionCelebration}
              />
            </div>
          ) : (
            /* Standard Video Lecture / Lab Environment */
            <>
              {/* Video Container with Bunny Stream Player */}
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="relative rounded-[24px] overflow-hidden bg-black shadow-2xl aspect-video flex items-center justify-center border border-slate-800"
              >
                <BunnyPlayer
                  key={activeLesson?.id || activeLesson?.videoUrl || 'no-lesson'}
                  src={activeLesson?.videoUrl}
                  title={activeLesson?.title}
                  moduleTitle={courseContent?.sections?.find(s => s.lessons?.some(l => l.id === activeLesson?.id))?.title}
                  currentUser={currentUser}
                  onTimeUpdate={(seconds) => setCurrentVideoTime(seconds)}
                  onEnded={() => {
                    if (activeLesson?.id && !completedLessonIds.has(activeLesson.id)) {
                      handleCompleteCurrentLesson();
                    }
                  }}
                />
              </div>

              {/* Active Lecture Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-totc-teal uppercase tracking-wider">
                      აქტიური ლექცია
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-medium">
                      {activeLesson?.lessonType === 'Assignment' ? 'დავალება' : 'ვიდეო'}
                    </span>
                  </div>
                  <h2 className="font-bold text-xl text-white">
                    {activeLesson?.title || 'ლექცია'}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {completedLessonIds.has(activeLesson?.id) ? (
                    <div className="px-4 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>დასრულებულია</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteCurrentLesson}
                      className="px-5 py-2.5 rounded-full bg-totc-teal text-white hover:bg-totc-teal-dark text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>დასრულებულად მონიშვნა</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Course Completed Celebration Banner or Module Unlocked Banner */}
              {isCourseFullyCompleted ? (
                <div className="p-5 bg-gradient-to-r from-amber-950/50 via-emerald-950/40 to-slate-900 border-2 border-amber-400/60 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                      <Trophy className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                        <span>🏆 გილოცავთ! თქვენ წარმატებით დაასრულეთ კურსი!</span>
                      </h4>
                      <p className="text-xs text-amber-200/90 mt-0.5">
                        ყველა მოდული და გამოცდა წარმატებითაა ჩაბარებული (100%). თქვენი ოფიციალური აკრედიტებული სერტიფიკატი მზადაა.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      loadEarnedCertificate();
                      setShowCompletionCelebration(true);
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all shrink-0 flex items-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>სერტიფიკატის ნახვა</span>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              ) : moduleUnlockNotice ? (
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
              ) : null}

              {successNotice && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Horizontal Tabs Bar */}
              <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60 space-y-6">
                <div className="flex border-b border-slate-700 gap-4 sm:gap-8 overflow-x-auto pb-1 text-sm font-semibold">
                  {[
                    { id: 'overview', label: 'მიმოხილვა', icon: BookOpen, badge: null },
                    { 
                      id: 'quiz', 
                      label: 'გამოცდა / ქვიზი', 
                      icon: HelpCircle, 
                      badge: (quizData?.questions?.length || activeLesson?.quiz?.questions?.length || (activeLesson?.hasQuiz ? 1 : 0)) || null 
                    },
                    { 
                      id: 'resources', 
                      label: 'რესურსები', 
                      icon: Download, 
                      badge: activeLesson?.resources?.length > 0 
                        ? `${activeLesson.resources.length} ფაილი` 
                        : (activeLesson?.id === 'les-1' ? '2 ფაილი' : null) 
                    },
                    { id: 'qa', label: 'კითხვა-პასუხი', icon: MessageSquare, badge: questionsList.length },
                    { id: 'notes', label: 'ჩანაწერები', icon: FileText, badge: notesList.length },
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

                {/* If current lesson is locked */}
                {isCurrentLessonLocked ? (
                  <div className="p-10 text-center bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3 animate-in fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base text-white">მასალები და ქვიზი დაბლოკილია</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      ამ ლექციის ქვიზზე, გადმოსაწერ რესურსებსა და მასალებზე წვდომა შეზღუდულია, სანამ წინა ლექციას არ გაივლით და არ მონიშნავთ დასრულებულად.
                    </p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'overview' && (
                      <LessonOverviewTab activeLesson={activeLesson} />
                    )}

                    {activeTab === 'quiz' && (
                      <ExamEnvironmentView
                        quizData={quizData}
                        cooldownRemainingSeconds={cooldownRemainingSeconds}
                        formatCooldownTime={formatCooldownTime}
                        quizResult={quizResult}
                        activeLesson={activeLesson}
                        allLessons={allLessons}
                        handleLessonSwitch={handleLessonSwitch}
                        setActiveTab={setActiveTab}
                        isExamStarted={isExamStarted}
                        handleStartExam={handleStartExam}
                        examStrikes={examStrikes}
                        examTimerSeconds={examTimerSeconds}
                        formatExamTime={formatExamTime}
                        isFullscreenExam={isFullscreenExam}
                        toggleFullscreenExam={toggleFullscreenExam}
                        proctorToast={proctorToast}
                        triggerProctorToast={triggerProctorToast}
                        selectedAnswers={selectedAnswers}
                        handleSelectOption={handleSelectOption}
                        examTerminated={examTerminated}
                        handleSubmitQuiz={handleSubmitQuiz}
                        isSubmittingQuiz={isSubmittingQuiz}
                        handleRetakeQuiz={handleRetakeQuiz}
                        courseContent={courseContent}
                        loadEarnedCertificate={loadEarnedCertificate}
                        setShowCompletionCelebration={setShowCompletionCelebration}
                      />
                    )}

                    {activeTab === 'resources' && (
                      <LessonResourcesTab activeLesson={activeLesson} resolveVideoUrl={resolveVideoUrl} />
                    )}

                    {activeTab === 'qa' && (
                      <LessonQaTab
                        questionsList={questionsList}
                        newQuestionText={newQuestionText}
                        setNewQuestionText={setNewQuestionText}
                        includeTimestampInQuestion={includeTimestampInQuestion}
                        setIncludeTimestampInQuestion={setIncludeTimestampInQuestion}
                        currentVideoTime={currentVideoTime}
                        handleAddQuestion={handleAddQuestion}
                        handleSeekToTime={handleSeekToTime}
                        formatSeconds={formatSeconds}
                      />
                    )}

                    {activeTab === 'notes' && (
                      <LessonNotesTab
                        notesList={notesList}
                        setNotesList={setNotesList}
                        newNoteText={newNoteText}
                        setNewNoteText={setNewNoteText}
                        currentVideoTime={currentVideoTime}
                        handleAddNote={handleAddNote}
                        handleSeekToTime={handleSeekToTime}
                        formatSeconds={formatSeconds}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Player Curriculum Sidebar (4 Cols) */}
        <PlayerCurriculumSidebar
          courseContent={courseContent}
          allLessons={allLessons}
          isOpenAccessCourse={isOpenAccessCourse}
          isCourseFullyCompleted={isCourseFullyCompleted}
          loadEarnedCertificate={loadEarnedCertificate}
          setShowCompletionCelebration={setShowCompletionCelebration}
          isSectionUnlocked={isSectionUnlocked}
          isLessonUnlocked={isLessonUnlocked}
          activeLesson={activeLesson}
          completedLessonIds={completedLessonIds}
          handleLessonSwitch={handleLessonSwitch}
        />

      </div>

      {/* Completion & Certificate Celebration Modal + Proctor Strike Modal */}
      <CourseCompletionModal
        strikeModal={strikeModal}
        setStrikeModal={setStrikeModal}
        handleRetakeQuiz={handleRetakeQuiz}
        showCompletionCelebration={showCompletionCelebration}
        setShowCompletionCelebration={setShowCompletionCelebration}
        earnedCertificate={earnedCertificate}
        resolvedUser={resolvedUser}
        courseContent={courseContent}
        activeCourse={activeCourse}
        copiedCertLink={copiedCertLink}
        handleCopyCertLink={handleCopyCertLink}
        handleDownloadPdf={handleDownloadPdf}
        setActivePage={setActivePage}
      />

    </div>
  );
}
