import React from 'react';
import { 
  HelpCircle, Clock, BookOpen, Award, Timer, ShieldCheck, 
  ShieldAlert, Lock, Play, EyeOff, AlertTriangle, Minimize2, 
  Maximize2, Check, X, AlertCircle, ArrowRight, RefreshCw, Sparkles 
} from 'lucide-react';

export function ExamEnvironmentView({
  quizData,
  cooldownRemainingSeconds,
  formatCooldownTime,
  quizResult,
  activeLesson,
  allLessons,
  handleLessonSwitch,
  setActiveTab,
  isExamStarted,
  handleStartExam,
  examStrikes,
  examTimerSeconds,
  formatExamTime,
  isFullscreenExam,
  toggleFullscreenExam,
  proctorToast,
  triggerProctorToast,
  selectedAnswers,
  handleSelectOption,
  examTerminated,
  handleSubmitQuiz,
  isSubmittingQuiz,
  handleRetakeQuiz,
  courseContent,
  loadEarnedCertificate,
  setShowCompletionCelebration,
}) {
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
        <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="font-bold text-sm text-white">ამ ლექციაზე ქვიზი არ არის</h4>
        <p className="text-xs text-slate-400">
          ლექტორს ამ ლექციისთვის ქვიზი ჯერ არ დაუმატებია.
        </p>
      </div>
    );
  }

  if (cooldownRemainingSeconds > 0 && !quizResult?.passed) {
    /* VIEW 1: COOLDOWN LOCKOUT SCREEN (1-Hour Retake Delay) */
    return (
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
          {allLessons.findIndex(l => l.id === activeLesson?.id) > 0 ? (
            <button
              onClick={() => {
                const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
                handleLessonSwitch(allLessons[idx - 1]);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 წინა მასალების გადამეორება</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('overview')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>📖 მასალების გადამეორება (Overview)</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isExamStarted && (!quizResult || !quizResult.passed)) {
    /* VIEW 2: PRE-EXAM BRIEFING & START SCREEN */
    return (
      <div className="p-6 md:p-8 bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 animate-in fade-in duration-300">
        {/* Briefing Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal border border-totc-teal/30 text-xs font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>ოფიციალური შემაჯამებელი ტესტირება</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">
              {quizData?.title || `ცოდნის შემოწმება: ${activeLesson?.title || 'ლექციის ტესტი'}`}
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
    );
  }

  /* VIEW 3 & 4: ACTIVE EXAM OR PASSED RESULT SCREEN */
  return (
    <div className="space-y-6">
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
            {quizData?.title || `ცოდნის შემოწმება: ${activeLesson?.title || 'ლექციის ტესტი'}`}
          </h3>
          <p className="text-xs text-slate-400">
            {quizData?.description || 'უპასუხეთ ქვემოთ მოცემულ შეკითხვებს მასალის ასათვისებლად.'}
          </p>
        </div>

        {quizData && (
          <div className="px-3 py-1 rounded-full bg-totc-teal/15 text-totc-teal text-xs font-bold shrink-0">
            გამსვლელი: {quizData.passingScorePercentage || 70}%
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
                  <span><strong>ახსნა-განმარტება:</strong> {feedback.explanation}</span>
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
              quizResult.passed ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'
            }`}>
              {quizResult.scorePercentage}%
            </div>
            <div>
              <p className={`font-bold text-sm ${quizResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {quizResult.passed ? 'ტესტი წარმატებით ჩაბარებულია! 🎉' : 'ტესტი ვერ ჩაბარდა'}
              </p>
              <p className="text-xs text-slate-300">
                {quizResult.passed
                  ? `🎉 შესანიშნავი შედეგია! თქვენ წარმატებით ჩააბარეთ ტესტი ${quizResult.scorePercentage}% ქულით და ლექცია დასრულებულია.`
                  : (quizResult.feedbackMessage || `თქვენი შედეგია ${quizResult.scorePercentage}%. გამსვლელი ბარიერია ${quizData?.passingScorePercentage || 70}%. გაიმეორეთ მასალა და სცადეთ ხელახლა!`)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            შეავსეთ ყველა შეკითხვა და დააჭირეთ პასუხების შემოწმებას.
          </p>
        )}

        <div className="flex items-center gap-3">
          {quizResult ? (
            quizResult.passed ? (
              (() => {
                const allLessonsList = courseContent?.sections?.flatMap(s => s.lessons) || [];
                const currentIdx = allLessonsList.findIndex(l => l.id === activeLesson?.id);
                const nextLessonObj = currentIdx >= 0 && currentIdx < allLessonsList.length - 1 ? allLessonsList[currentIdx + 1] : null;

                if (nextLessonObj) {
                  return (
                    <button
                      onClick={() => handleLessonSwitch(nextLessonObj)}
                      className="px-6 py-3 rounded-full text-xs font-bold bg-totc-teal hover:bg-totc-teal-dark text-white transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 group cursor-pointer active:scale-98"
                    >
                      <span>შემდეგ ლექციაზე გადასვლა</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  );
                } else {
                  return (
                    <button
                      onClick={() => {
                        if (loadEarnedCertificate) loadEarnedCertificate();
                        if (setShowCompletionCelebration) setShowCompletionCelebration(true);
                      }}
                      className="px-6 py-3 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 hover:brightness-110 text-slate-950 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>გილოცავთ! სერტიფიკატის მიღება 🎉</span>
                    </button>
                  );
                }
              })()
            ) : (
              <button
                onClick={handleRetakeQuiz}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ხელახლა ცდა</span>
              </button>
            )
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < (quizData?.questions?.length || 1) || examTerminated}
              className={`px-8 py-3 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                Object.keys(selectedAnswers).length >= (quizData?.questions?.length || 1) && !examTerminated
                  ? 'bg-totc-teal text-white hover:bg-totc-teal-dark cursor-pointer'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmittingQuiz ? 'მოწმდება...' : 'პასუხების შემოწმება'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default ExamEnvironmentView;
