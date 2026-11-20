import React, { useState, useEffect } from 'react';
import { 
  X, Check, XCircle, AlertCircle, Video, Play, ExternalLink, 
  Clock, BookOpen, CheckCircle2, ShieldCheck, Sparkles, Layers, FileText
} from 'lucide-react';
import BunnyPlayer from '../BunnyPlayer';

export function CourseReviewModal({
  reviewModalCourse,
  setReviewModalCourse,
  rejectDialogCourse,
  setRejectDialogCourse,
  rejectionFeedback,
  setRejectionFeedback,
  handleApproveCourse,
  handleConfirmReject,
}) {
  const [activeLessonId, setActiveLessonId] = useState(null);

  // When modal course is loaded or changed, select the first lesson
  useEffect(() => {
    if (reviewModalCourse?.sections?.length > 0) {
      const firstSection = reviewModalCourse.sections[0];
      if (firstSection?.lessons?.length > 0) {
        setActiveLessonId(firstSection.lessons[0].id);
      }
    }
  }, [reviewModalCourse]);

  // Flatten all lessons across all sections
  const allLessons = reviewModalCourse?.sections?.flatMap(s => s.lessons || []) || [];
  const activeLesson = allLessons.find(l => l.id === activeLessonId) || allLessons[0] || null;
  const activeSection = reviewModalCourse?.sections?.find(s => s.lessons?.some(l => l.id === activeLesson?.id));
  const totalDurationMinutes = allLessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

  return (
    <>
      {/* Course Curriculum & Video Audit Studio Modal for Admin */}
      {reviewModalCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-6xl w-full shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header (Pinned) */}
            <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={reviewModalCourse.thumbnailUrl || '/assets/explore_row_1.png'}
                  alt={reviewModalCourse.title}
                  className="w-20 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      <span>კურსის აუდიტი და ხარისხის შემოწმება</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      reviewModalCourse.approvalStatus === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : reviewModalCourse.approvalStatus === 'PendingApproval' 
                          ? 'bg-amber-50 text-amber-700 animate-pulse' 
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {reviewModalCourse.approvalStatus === 'Approved' ? '✓ დამტკიცებული' : reviewModalCourse.approvalStatus === 'PendingApproval' ? '● განხილვის მოლოდინში' : '✕ უარყოფილი'}
                    </span>
                  </div>
                  <h2 className="font-poppins font-black text-xl sm:text-2xl text-totc-navy mt-1 truncate">
                    {reviewModalCourse.title}
                  </h2>
                  <p className="text-xs text-totc-gray flex flex-wrap items-center gap-2 mt-0.5">
                    <span>ინსტრუქტორი: <strong className="text-totc-navy">{reviewModalCourse.instructorName}</strong></span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{reviewModalCourse.instructorEmail}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReviewModalCourse(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                title="დახურვა"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">კატეგორია და დონე</span>
                <p className="font-bold text-totc-navy mt-0.5 truncate">
                  {reviewModalCourse.categoryName} • {reviewModalCourse.level}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">საფასური</span>
                <p className="font-black text-totc-teal mt-0.5">₾{reviewModalCourse.price}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">მოცულობა</span>
                <p className="font-bold text-totc-navy mt-0.5">
                  {reviewModalCourse.sections?.length || 0} მოდული • {allLessons.length} ლექცია
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">საერთო ხანგრძლივობა</span>
                <p className="font-bold text-totc-navy mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-totc-teal" />
                  <span>{totalDurationMinutes} წუთი</span>
                </p>
              </div>
            </div>

            {/* Main Interactive Studio Body: 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Video Player & Lesson Deep Dive (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Active Video Player Container */}
                <div className="rounded-[22px] overflow-hidden bg-black shadow-xl border border-slate-800 relative aspect-video flex items-center justify-center">
                  {activeLesson?.videoUrl ? (
                    <BunnyPlayer
                      key={activeLesson.id || activeLesson.videoUrl}
                      src={activeLesson.videoUrl}
                      poster={reviewModalCourse.thumbnailUrl}
                      title={activeLesson.title}
                      moduleTitle={activeSection?.title}
                      autoPlay={false}
                    />
                  ) : (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Video className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                      <p className="font-bold text-sm text-slate-300">ამ ლექციას ვიდეო ნაკადი არ აქვს მიბმული</p>
                      <p className="text-xs text-slate-500">ინსტრუქტორს ჯერ არ აუტვირთავს ვიდეო ფაილი ამ გაკვეთილისთვის.</p>
                    </div>
                  )}
                </div>

                {/* Active Lesson Details Card */}
                {activeLesson ? (
                  <div className="p-5 rounded-2xl bg-white border border-gray-150 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-totc-teal">
                          {activeSection?.title || 'მიმდინარე მოდული'}
                        </span>
                        <h3 className="font-poppins font-black text-lg text-totc-navy">
                          {activeLesson.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-totc-gray" />
                          <span>{activeLesson.durationMinutes} წუთი</span>
                        </span>
                        {activeLesson.isFreePreview ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                            🎁 უფასო საჩვენებელი
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                            🔒 სრული წვდომა
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stream URL inspector */}
                    {activeLesson.videoUrl && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Video className="w-4 h-4 text-totc-teal shrink-0" />
                          <span className="font-mono text-[11px] text-slate-600 truncate">
                            {activeLesson.videoUrl}
                          </span>
                        </div>
                        <a
                          href={activeLesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-totc-navy hover:text-totc-teal text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                          title="ვიდეოს პირდაპირი ბმულის გახსნა"
                        >
                          <span>გახსნა</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Lesson Notes / Content Description */}
                    {activeLesson.contentText ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-totc-navy flex items-center gap-1.5 uppercase tracking-wider">
                          <FileText className="w-3.5 h-3.5 text-totc-teal" />
                          <span>ლექციის შენიშვნები და მასალები:</span>
                        </span>
                        <p className="text-xs text-totc-gray bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                          {activeLesson.contentText}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">დამატებითი ტექსტური შენიშვნები მითითებული არ არის.</p>
                    )}
                  </div>
                ) : null}

              </div>

              {/* Right Column: Curriculum Tree & Quality Checklist (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Course Syllabus & Lecture Switcher */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-poppins font-black text-sm text-totc-navy flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-totc-teal" />
                      <span>კურსის სილაბუსი და ლექციები</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-gray-200">
                      {allLessons.length} ლექცია
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    დააჭირეთ ნებისმიერ ლექციას, რათა მომენტალურად ჩაირთოს შესაბამისი ვიდეო და შეამოწმოთ მისი ხარისხი.
                  </p>

                  {/* Modules & Lessons List */}
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {reviewModalCourse.sections && reviewModalCourse.sections.map((section, sIdx) => (
                      <div key={section.id} className="p-3 bg-white rounded-xl border border-gray-250 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-totc-navy flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-totc-navy text-white text-[10px] flex items-center justify-center font-bold">
                              {sIdx + 1}
                            </span>
                            <span className="truncate">{section.title}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {section.lessons?.length || 0} გაკვეთილი
                          </span>
                        </div>

                        {/* Lessons in section */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-100">
                          {section.lessons && section.lessons.map((lesson, lIdx) => {
                            const isSelected = activeLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                                  isSelected 
                                    ? 'bg-totc-navy text-white shadow-md border-l-4 border-totc-teal' 
                                    : 'bg-slate-50 hover:bg-slate-100/90 text-totc-navy border border-slate-150'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-totc-teal text-white' : 'bg-white text-slate-600 shadow-2xs'
                                  }`}>
                                    {isSelected ? <Play className="w-3 h-3 fill-white" /> : <Video className="w-3 h-3" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-totc-navy'}`}>
                                      {lIdx + 1}. {lesson.title}
                                    </p>
                                    <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                      {lesson.durationMinutes} წუთი {lesson.isFreePreview && '• 🎁 უფასო'}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <span className="text-[10px] font-black uppercase tracking-wider text-totc-teal shrink-0">
                                    უკრავს
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Checklist Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ადმინისტრატორის ხარისხის კრიტერიუმები:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-indigo-950 font-medium">
                    <div className="p-2 rounded-xl bg-white border border-indigo-100/60 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1080p / 720p HD ვიდეო</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-indigo-100/60 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>სუფთა აუდიო და ხმა</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-indigo-100/60 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>სილაბუსის სისრულე</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-indigo-100/60 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>სწორი ქრონომეტრაჟი</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            </div>

            {/* Modal Actions Footer (Pinned Bottom) */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-totc-gray flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>კურსი მზადაა ვერიფიკაციისთვის. მიიღეთ გადაწყვეტილება:</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setReviewModalCourse(null)}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-white text-totc-navy hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  დახურვა
                </button>

                <button
                  onClick={() => {
                    setRejectDialogCourse(reviewModalCourse);
                  }}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>უარყოფა და ხარვეზების გაგზავნა</span>
                </button>

                <button
                  onClick={() => handleApproveCourse(reviewModalCourse.id, reviewModalCourse.title)}
                  className="px-7 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>დამტკიცება და გამოქვეყნება</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Reject / Request Changes Feedback Dialog */}
      {rejectDialogCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>პროგრამაში ცვლილებების მოთხოვნა</span>
              </h3>
              <button onClick={() => setRejectDialogCourse(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-totc-gray">
              მიუთითეთ კონსტრუქციული უკუკავშირი ინსტრუქტორისთვის <strong className="text-totc-navy">{rejectDialogCourse.instructorName}</strong> კურსზე <strong>„{rejectDialogCourse.title}“</strong>:
            </p>

            <textarea
              rows={4}
              placeholder="მაგ: გთხოვთ ატვირთოთ მინიმუმ 720p ხარისხის ვიდეო ლექციები და დაამატოთ კოდის ფაილები მეორე მოდულში..."
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectDialogCourse(null)}
                className="px-4 py-2 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200"
              >
                გაუქმება
              </button>

              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-full font-bold text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                გაგზავნა და უარყოფა
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CourseReviewModal;
