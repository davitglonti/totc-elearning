import React from 'react';
import { Search, CheckCircle, Clock, XCircle, Eye, EyeOff, Star, Trash2 } from 'lucide-react';

export function AdminCoursesTab({
  courseSearch,
  setCourseSearch,
  courseStatusFilter,
  setCourseStatusFilter,
  pendingCourses,
  filteredCourses,
  handleOpenReviewModal,
  handleToggleCoursePublish,
  handleToggleCoursePopular,
  setSelectedCourse,
  setActivePage,
  handleDeleteCourse,
}) {
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy">კურსების კატალოგი და გამოქვეყნება</h3>
          <p className="text-xs text-totc-gray">ყველა კურსი, ვერიფიკაციის სტატუსი, ჩარიცხული სტუდენტები და ხილვადობის მართვა.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ძებნა კურსით ან ინსტრუქტორით..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal w-56 sm:w-64"
            />
          </div>

          <select
            value={courseStatusFilter}
            onChange={(e) => setCourseStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-totc-navy bg-white focus:outline-none focus:border-totc-teal cursor-pointer"
          >
            <option value="ALL">ყველა სტატუსი</option>
            <option value="PENDING">განხილვის მოლოდინში ({pendingCourses.length})</option>
            <option value="APPROVED">დამტკიცებული და აქტიური</option>
            <option value="REJECTED">უარყოფილი</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">კურსი</th>
              <th className="py-3 px-4">ინსტრუქტორი</th>
              <th className="py-3 px-4">მოდერაციის სტატუსი</th>
              <th className="py-3 px-4">ფასი</th>
              <th className="py-3 px-4">სტუდენტები</th>
              <th className="py-3 px-4">ხილვადობა</th>
              <th className="py-3 px-4">პრიორიტეტი</th>
              <th className="py-3 px-4 text-right">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCourses.map(course => (
              <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnailUrl || '/assets/explore_row_1.png'}
                      alt={course.title}
                      className="w-12 h-9 rounded-lg object-cover shrink-0 border border-gray-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-totc-navy truncate max-w-xs">{course.title}</p>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-totc-gray text-[10px] font-semibold">
                        {course.categoryName} • {course.level}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-semibold text-totc-navy">{course.instructorName}</p>
                  <p className="text-[10px] text-totc-gray">{course.instructorEmail}</p>
                </td>

                {/* Approval Status Badge */}
                <td className="py-3.5 px-4">
                  {course.approvalStatus === 'Approved' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>დამტკიცებული</span>
                    </span>
                  )}
                  {course.approvalStatus === 'PendingApproval' && (
                    <button
                      onClick={() => handleOpenReviewModal(course.id)}
                      className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 inline-flex items-center gap-1 hover:bg-amber-100"
                      title="დააჭირეთ განსახილველად და დასამტკიცებლად"
                    >
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>განხილვის მოლოდინში</span>
                    </button>
                  )}
                  {course.approvalStatus === 'Rejected' && (
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200 inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span>საჭიროებს ცვლილებებს</span>
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 font-poppins font-black text-totc-navy">
                  ₾{Number(course.price).toFixed(2)}
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-bold text-totc-teal bg-teal-50 px-2.5 py-1 rounded-full text-[11px]">
                    {course.studentsCount} სტუდენტი
                  </span>
                </td>

                {/* Interactive Publish Toggle */}
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleToggleCoursePublish(course.id, course.isPublished)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      course.isPublished
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                    title="სტატუსის შეცვლა"
                  >
                    {course.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{course.isPublished ? 'აქტიური' : 'დამალული'}</span>
                  </button>
                </td>

                {/* Popular / Pinned to Catalog Top Toggle */}
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleToggleCoursePopular(course.id, course.isPopular)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      course.isPopular
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 ring-2 ring-amber-300/40'
                        : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-800 border border-gray-200'
                    }`}
                    title={course.isPopular ? "კურსი მონიშნულია როგორც პოპულარული და ჩნდება კატალოგის სათავეში" : "დააჭირეთ კატალოგის სათავეში პოპულარულად გამოსატანად"}
                  >
                    <Star className={`w-3.5 h-3.5 ${course.isPopular ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                    <span>{course.isPopular ? '⭐ სათავეში' : 'სტანდარტული'}</span>
                  </button>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenReviewModal(course.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      title="პროგრამისა და ლექციების შემოწმება"
                    >
                      შემოწმება
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setActivePage('course-detail');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-totc-navy hover:bg-totc-teal hover:text-white transition-colors"
                    >
                      ნახვა
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="კურსის წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCourses.length === 0 && (
          <div className="py-12 text-center text-totc-gray text-xs">
            თქვენი მოთხოვნის შესაბამისი კურსები ვერ მოიძებნა.
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminCoursesTab;
