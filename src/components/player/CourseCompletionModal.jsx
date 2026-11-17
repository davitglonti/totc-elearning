import React from 'react';
import { 
  ShieldAlert, AlertTriangle, RefreshCw, Trophy, X, 
  GraduationCap, CheckCircle, CheckCheck, Copy, Award, Printer 
} from 'lucide-react';

export function CourseCompletionModal({
  strikeModal,
  setStrikeModal,
  handleRetakeQuiz,
  showCompletionCelebration,
  setShowCompletionCelebration,
  earnedCertificate,
  resolvedUser,
  courseContent,
  activeCourse,
  copiedCertLink,
  handleCopyCertLink,
  handleDownloadPdf,
  setActivePage,
}) {
  return (
    <>
      {/* STRIKE WARNING & DISQUALIFICATION OVERLAY MODAL */}
      {strikeModal?.isOpen && (
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
                    if (handleRetakeQuiz) handleRetakeQuiz();
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

      {/* COURSE COMPLETION & ACCREDITED CERTIFICATE CELEBRATION MODAL */}
      {showCompletionCelebration && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="max-w-4xl w-full my-auto bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/20 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      კურსი დასრულებულია 100%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      ოფიციალური სერტიფიკატი
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    🎉 გილოცავთ! თქვენ წარმატებით დაასრულეთ კურსი!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    თქვენ წარმატებით გაიარეთ ყველა მოდული, პრაქტიკული დავალება და გამოცდა. თქვენი აკრედიტებული სერტიფიკატი გაცემულია.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCompletionCelebration(false)}
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                title="დახურვა"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Canvas / Card Preview */}
            <div className="p-4 sm:p-8 bg-slate-950/60 overflow-x-auto flex justify-center">
              <div className="w-full max-w-3xl bg-[#FAF9F6] text-slate-900 rounded-2xl border-8 border-slate-900 shadow-2xl p-6 sm:p-10 relative overflow-hidden select-none">
                
                {/* Decorative Inner Border Frame */}
                <div className="absolute inset-2 sm:inset-3 border-2 border-amber-500/40 pointer-events-none rounded-xl" />
                <div className="absolute inset-3 sm:inset-4 border border-dashed border-slate-300 pointer-events-none rounded-lg" />

                {/* Certificate Content */}
                <div className="relative z-10 text-center space-y-4">
                  
                  {/* Top Accreditation Strip */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-totc-teal" />
                      <span className="font-extrabold text-xs tracking-widest uppercase text-slate-800">TOTC ONLINE ACADEMY</span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      № {earnedCertificate?.certificateNumber || 'TOTC-2026-ARCH'}
                    </div>
                  </div>

                  {/* Main Title */}
                  <div className="pt-2">
                    <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-wide uppercase">
                      აკადემიური სერტიფიკატი
                    </h1>
                    <p className="text-xs sm:text-sm font-serif italic text-amber-700/90 font-medium">
                      Certificate of Course Completion & Mastery
                    </p>
                  </div>

                  {/* Student Name */}
                  <div className="pt-2 pb-1">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                      წინამდებარე სერტიფიკატი გადაეცემა:
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 mt-1 pb-1 inline-block border-b-2 border-slate-800 px-6 sm:px-12">
                      {earnedCertificate?.studentName || resolvedUser?.fullName || 'Gloria Rose'}
                    </h2>
                  </div>

                  {/* Course Details */}
                  <div className="max-w-xl mx-auto space-y-1.5 pt-1">
                    <p className="text-xs text-slate-600">
                      რომელმაც 100%-ით წარმატებით დაასრულა აკრედიტებული სასწავლო პროგრამა:
                    </p>
                    <h3 className="text-base sm:text-xl font-extrabold text-totc-teal">
                      {earnedCertificate?.courseTitle || courseContent?.title || activeCourse?.title || 'AWS Certified Solutions Architect & Cloud Operations'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      სასწავლო მოდულების, პრაქტიკული ლაბორატორიებისა და ფინალური საგამოცდო შეფასების სრული გავლით.
                    </p>
                  </div>

                  {/* Signatures & Seal Bar */}
                  <div className="grid grid-cols-3 items-end pt-6 sm:pt-8 border-t border-slate-200 mt-4">
                    
                    {/* Instructor Signature */}
                    <div className="text-center space-y-1">
                      <div className="font-serif italic font-bold text-slate-800 text-sm sm:text-base border-b border-slate-400 pb-1 mx-2 sm:mx-6">
                        {earnedCertificate?.instructorName || courseContent?.instructorName || activeCourse?.instructorName || 'Lina Wilson'}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        ინსტრუქტორი
                      </p>
                    </div>

                    {/* Official Golden Seal */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-4 border-amber-700/40 shadow-lg flex flex-col items-center justify-center text-amber-950 font-black leading-none transform rotate-[-6deg] hover:rotate-0 transition-transform cursor-pointer" title="აკადემიური დამოწმების ბეჭედი">
                        <span className="text-[7px] sm:text-[8px] tracking-wider">★ TOTC ★</span>
                        <span className="text-[9px] sm:text-[11px] font-extrabold my-0.5">OFFICIAL</span>
                        <span className="text-[7px] sm:text-[8px] tracking-wider">VERIFIED</span>
                      </div>
                    </div>

                    {/* Issue Date */}
                    <div className="text-center space-y-1">
                      <div className="font-medium text-slate-800 text-xs sm:text-sm border-b border-slate-400 pb-1 mx-2 sm:mx-6">
                        {new Date(earnedCertificate?.issuedAt || Date.now()).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        გაცემის თარიღი
                      </p>
                    </div>
                  </div>

                  {/* Verification Hash Footer */}
                  <div className="pt-3 text-[9px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 mt-3">
                    <span className="truncate">
                      HASH: {earnedCertificate?.verificationHash || 'SHA-256:7e8b2a1c0d4e5f6a7b8c9d0e1f2a3b4c'}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      TOTC აკადემიური რეესტრით დამოწმებული
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCertLink}
                  className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 border border-slate-700"
                >
                  {copiedCertLink ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">ბმული დაკოპირდა!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>ვერიფიკაციის ბმული</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowCompletionCelebration(false)}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  მასალების გადახედვა
                </button>

                <button
                  onClick={() => {
                    setShowCompletionCelebration(false);
                    if (setActivePage) setActivePage('certificate-detail', earnedCertificate);
                  }}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="გადადით სერტიფიკატის ოფიციალურ ცალკე გვერდზე"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>სერტიფიკატის გვერდი</span>
                </button>

                <button
                  onClick={() => setActivePage && setActivePage('dashboard')}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>ჩემი კაბინეტი</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>სერტიფიკატის ჩამოტვირთვა (PDF)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
export default CourseCompletionModal;
