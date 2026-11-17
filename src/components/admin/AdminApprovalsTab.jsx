import React from 'react';
import { CheckSquare, CheckCircle, FileText, XCircle, Check } from 'lucide-react';

export function AdminApprovalsTab({
  pendingCourses,
  handleOpenReviewModal,
  setRejectDialogCourse,
  handleApproveCourse,
}) {
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <span>კურსების მოდერაცია და ხარისხის შემოწმება</span>
          </h3>
          <p className="text-xs text-totc-gray">
            შეამოწმეთ ინსტრუქტორების სასწავლო გეგმები, ვიდეო ბმულები და დაამტკიცეთ კურსები კატალოგში გამოსაქვეყნებლად.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs">
          {pendingCourses.length} კურსი მოლოდინშია
        </span>
      </div>

      {pendingCourses.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-poppins font-bold text-totc-navy text-base">ყველაფერი შემოწმებულია!</h4>
          <p className="text-xs text-totc-gray max-w-sm mx-auto">
            ამჟამად არც ერთი კურსი არ ელოდება დამტკიცებას. ინსტრუქტორების მიერ შექმნილი ახალი კურსები აქ გამოჩნდება.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCourses.map(course => (
            <div 
              key={course.id}
              className="p-5 sm:p-6 rounded-2xl border-2 border-amber-100 bg-amber-50/20 hover:border-amber-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={course.thumbnailUrl || '/assets/explore_row_1.png'}
                  alt={course.title}
                  className="w-20 h-14 sm:w-28 sm:h-20 rounded-xl object-cover shrink-0 border border-gray-200 shadow-sm"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] tracking-wide uppercase">
                      განხილვის მოლოდინში
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-totc-gray text-[10px] font-semibold">
                      {course.categoryName} • {course.level}
                    </span>
                  </div>
                  <h4 className="font-poppins font-bold text-base text-totc-navy truncate">
                    {course.title}
                  </h4>
                  <p className="text-xs text-totc-gray line-clamp-2">
                    {course.description}
                  </p>
                  <div className="text-[11px] text-totc-gray flex items-center gap-3 pt-1">
                    <span>ინსტრუქტორი: <strong className="text-totc-navy">{course.instructorName}</strong> ({course.instructorEmail})</span>
                    <span>•</span>
                    <span>ლექციები: <strong className="text-totc-navy">{course.lessonsCount}</strong></span>
                    <span>•</span>
                    <span>ფასი: <strong className="text-totc-navy">₾{course.price}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                {/* Inspect Syllabus */}
                <button
                  onClick={() => handleOpenReviewModal(course.id)}
                  className="px-4 py-2.5 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>პროგრამის ნახვა</span>
                </button>

                {/* Request Changes / Reject */}
                <button
                  onClick={() => setRejectDialogCourse(course)}
                  className="px-4 py-2.5 rounded-full font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>უარყოფა</span>
                </button>

                {/* Approve & Publish Live */}
                <button
                  onClick={() => handleApproveCourse(course.id, course.title)}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>დამტკიცება და გამოქვეყნება</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default AdminApprovalsTab;
