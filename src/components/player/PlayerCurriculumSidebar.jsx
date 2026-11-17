import React from 'react';
import { 
  Unlock, Lock, Trophy, Award, BookOpen, CheckCircle, 
  HelpCircle, Code, Play, Clock, Download 
} from 'lucide-react';

export function PlayerCurriculumSidebar({
  courseContent,
  allLessons,
  isOpenAccessCourse,
  isCourseFullyCompleted,
  loadEarnedCertificate,
  setShowCompletionCelebration,
  isSectionUnlocked,
  isLessonUnlocked,
  activeLesson,
  completedLessonIds,
  handleLessonSwitch,
}) {
  return (
    <div className="lg:col-span-4 bg-[#1E293B] border-t lg:border-t-0 lg:border-l border-slate-700/80 p-6 flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-lg text-white">კურსის შინაარსი</h3>
          <p className="text-xs text-slate-400">
            {courseContent?.sections?.length || 2} მოდული • {allLessons.length} ლექცია
          </p>
        </div>
        {isOpenAccessCourse ? (
          <span className="px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0" title="ავტორის მიერ დაშვებულია ნებისმიერ ლექციაზე თავისუფალი გადასვლა">
            <Unlock className="w-3 h-3" />
            <span>ღია წვდომა</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0" title="მასალები იხსნება ეტაპობრივად, წინამორბედი ლექციის გავლის მიხედვით">
            <Lock className="w-3 h-3" />
            <span>ეტაპობრივი</span>
          </span>
        )}
      </div>

      {/* Course Fully Completed Sidebar Banner */}
      {isCourseFullyCompleted && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/10 border border-amber-400/50 rounded-2xl flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-amber-300 leading-tight">კურსი დასრულებულია!</p>
              <p className="text-[10px] text-slate-300 truncate">სერტიფიკატი გაცემულია</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (loadEarnedCertificate) loadEarnedCertificate();
              if (setShowCompletionCelebration) setShowCompletionCelebration(true);
            }}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer shadow transition-all active:scale-95 flex items-center gap-1"
          >
            <Award className="w-3 h-3" />
            <span>სერტიფიკატი</span>
          </button>
        </div>
      )}

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
                  {section.lessons?.length || 0} ლექცია
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
                              <span>დაბლოკილია</span>
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
                            {lesson.durationMinutes || 15} წთ
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
  );
}
export default PlayerCurriculumSidebar;
