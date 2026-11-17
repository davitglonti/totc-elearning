import { useState, useEffect, useCallback } from 'react';

export function useExamProctoring({
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
}) {
  const [examStrikes, setExamStrikes] = useState(0);
  const [examTerminated, setExamTerminated] = useState(false);
  const [strikeModal, setStrikeModal] = useState({ isOpen: false, strikes: 0, message: '' });
  const [examTimerSeconds, setExamTimerSeconds] = useState(1200); // 20 mins default
  const [proctorToast, setProctorToast] = useState('');
  const [isFullscreenExam, setIsFullscreenExam] = useState(false);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);

  const getCooldownStorageKey = useCallback((lessonId) => {
    const uId = currentUserId || userEmail || 'student';
    return `totc_cooldown_${uId}_${lessonId || 'default'}`;
  }, [currentUserId, userEmail]);

  const triggerProctorToast = useCallback((msg) => {
    setProctorToast(msg);
    setTimeout(() => {
      setProctorToast(prev => prev === msg ? '' : prev);
    }, 2800);
  }, []);

  const formatExamTime = useCallback((totalSeconds) => {
    const mins = Math.max(0, Math.floor(totalSeconds / 60));
    const secs = Math.max(0, totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const formatCooldownTime = useCallback((totalSeconds) => {
    const safeSecs = Math.max(0, totalSeconds || 0);
    const hours = Math.floor(safeSecs / 3600);
    const mins = Math.floor((safeSecs % 3600) / 60);
    const secs = safeSecs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

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
  }, [activeTab, isExamStarted, quizResult, examTerminated, quizData, cooldownRemainingSeconds, activeLesson, getCooldownStorageKey, setIsExamStarted, setQuizResult]);

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
  }, [activeTab, isExamStarted, quizResult, quizData, cooldownRemainingSeconds, triggerProctorToast]);

  // 3. Anti-Cheating: Countdown Timer
  useEffect(() => {
    if (activeTab !== 'quiz' || !isExamStarted || quizResult || examTerminated || !quizData?.questions?.length || cooldownRemainingSeconds > 0) return;

    const timer = setInterval(() => {
      setExamTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (handleSubmitQuiz) handleSubmitQuiz();
          triggerProctorToast('⏱️ საგამოცდო დრო ამოიწურა! პასუხები ავტომატურად გაიგზავნა შესაფასებლად.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, isExamStarted, quizResult, examTerminated, quizData, cooldownRemainingSeconds, handleSubmitQuiz, triggerProctorToast]);

  // Fullscreen exam toggle
  const toggleFullscreenExam = useCallback(() => {
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
  }, []);

  return {
    examStrikes,
    setExamStrikes,
    examTerminated,
    setExamTerminated,
    strikeModal,
    setStrikeModal,
    examTimerSeconds,
    setExamTimerSeconds,
    proctorToast,
    setProctorToast,
    triggerProctorToast,
    isFullscreenExam,
    toggleFullscreenExam,
    cooldownRemainingSeconds,
    setCooldownRemainingSeconds,
    getCooldownStorageKey,
    formatExamTime,
    formatCooldownTime,
  };
}
export default useExamProctoring;
