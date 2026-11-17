import React from 'react';
import { X, Check, XCircle, AlertCircle, Video } from 'lucide-react';

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
  return (
    <>
      {/* Course Curriculum Audit & Inspection Modal for Admin */}
      {reviewModalCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={reviewModalCourse.thumbnailUrl || '/assets/explore_row_1.png'}
                  alt={reviewModalCourse.title}
                  className="w-16 h-12 rounded-xl object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                      პროგრამის შემოწმება
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      reviewModalCourse.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {reviewModalCourse.approvalStatus === 'Approved' ? 'დამტკიცებული' : reviewModalCourse.approvalStatus === 'PendingApproval' ? 'განხილვის მოლოდინში' : 'უარყოფილი'}
                    </span>
                  </div>
                  <h3 className="font-poppins font-black text-xl text-totc-navy mt-1">
                    {reviewModalCourse.title}
                  </h3>
                  <p className="text-xs text-totc-gray">
                    ავტორი: <strong className="text-totc-navy">{reviewModalCourse.instructorName}</strong> ({reviewModalCourse.instructorEmail})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReviewModalCourse(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course Overview Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div>
                <span className="text-totc-gray">კატეგორია და დონე:</span>
                <p className="font-bold text-totc-navy">{reviewModalCourse.categoryName} • {reviewModalCourse.level}</p>
              </div>
              <div>
                <span className="text-totc-gray">ფასი:</span>
                <p className="font-bold text-totc-navy">₾{reviewModalCourse.price}</p>
              </div>
              <div>
                <span className="text-totc-gray">მოდულები / ლექციები:</span>
                <p className="font-bold text-totc-navy">{reviewModalCourse.sections?.length || 0} მოდული • {reviewModalCourse.lessonsCount} ლექცია</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-totc-navy uppercase tracking-wider">კურსის სილაბუსის აღწერა:</span>
              <p className="text-xs text-totc-gray bg-slate-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                {reviewModalCourse.description}
              </p>
            </div>

            {/* Detailed Modules & Lectures List */}
            <div className="space-y-4">
              <h4 className="font-poppins font-bold text-sm text-totc-navy flex items-center gap-2">
                <Video className="w-4 h-4 text-totc-teal" />
                <span>წარმოდგენილი მოდულები და ვიდეო ლექციები:</span>
              </h4>

              {reviewModalCourse.sections && reviewModalCourse.sections.map((section, sIdx) => (
                <div key={section.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-totc-navy flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-totc-navy text-white text-[10px] flex items-center justify-center font-bold">
                        {sIdx + 1}
                      </span>
                      <span>{section.title}</span>
                    </span>
                    <span className="text-[10px] font-bold text-totc-gray">
                      {section.lessons?.length || 0} ლექცია
                    </span>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2 border-totc-teal/40">
                    {section.lessons && section.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-totc-navy">
                            {lIdx + 1}. {lesson.title}
                          </span>
                          <span className="text-[10px] font-semibold text-totc-gray">
                            ⏱️ {lesson.durationMinutes} წთ {lesson.isFreePreview && '• 🎁 უფასო ნახვა'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-totc-teal truncate">
                          სტრიმის ბმული: {lesson.videoUrl}
                        </p>
                        {lesson.contentText && (
                          <p className="text-[11px] text-totc-gray italic">
                            შენიშვნები: {lesson.contentText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setReviewModalCourse(null)}
                className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-colors"
              >
                დახურვა
              </button>

              <button
                onClick={() => {
                  setRejectDialogCourse(reviewModalCourse);
                }}
                className="px-5 py-2.5 rounded-full font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>უარყოფა და ცვლილებების მოთხოვნა</span>
              </button>

              <button
                onClick={() => handleApproveCourse(reviewModalCourse.id, reviewModalCourse.title)}
                className="px-6 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>დამტკიცება და გამოქვეყნება</span>
              </button>
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
