import React from 'react';
import { Search, Trash2, UserPlus, Sparkles } from 'lucide-react';

export function AdminUsersTab({
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  usersList,
  filteredUsers,
  currentUser,
  handleRoleChange,
  handleDeleteUser,
  onOpenCreateInstructor,
}) {
  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-poppins font-bold text-xl text-totc-navy flex items-center gap-2">
            <span>რეგისტრირებული მომხმარებლების მართვა</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-totc-gray">
              {usersList.length}
            </span>
          </h3>
          <p className="text-xs text-totc-gray mt-1">
            მართეთ პლატფორმის ანგარიშები, შეცვალეთ როლები ან დაამატეთ ახალი ინსტრუქტორები.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenCreateInstructor && (
            <button
              type="button"
              onClick={onOpenCreateInstructor}
              className="px-4 py-2.5 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-[#3da8aa] transition-all shadow-sm hover:shadow flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ ახალი ინსტრუქტორის დამატება</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ძებნა სახელით ან ელფოსტით..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal w-56 sm:w-64"
            />
          </div>

          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-totc-navy bg-white focus:outline-none focus:border-totc-teal cursor-pointer"
          >
            <option value="ALL">ყველა როლი ({usersList.length})</option>
            <option value="STUDENT">სტუდენტები</option>
            <option value="INSTRUCTOR">ინსტრუქტორები</option>
            <option value="ADMIN">ადმინისტრატორები</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">მომხმარებელი</th>
              <th className="py-3 px-4">როლი</th>
              <th className="py-3 px-4">წევრობა</th>
              <th className="py-3 px-4">აქტივობა</th>
              <th className="py-3 px-4">რეგისტრაცია</th>
              <th className="py-3 px-4 text-right">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => {
              const isSelf = currentUser && currentUser.email === user.email;
              return (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || '/assets/testimonial_avatar.png'}
                        alt={user.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-totc-teal/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-totc-navy truncate">
                          {user.fullName} {isSelf && <span className="text-[10px] text-totc-teal">(თქვენ)</span>}
                        </p>
                        <p className="text-[11px] text-totc-gray truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Interactive Role Switcher & 1-Click Promote */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer transition-colors ${
                          user.role === 'Admin'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : user.role === 'Instructor'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-teal-50 text-totc-teal border-teal-200'
                        } ${isSelf ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        <option value="Student">სტუდენტი</option>
                        <option value="Instructor">ინსტრუქტორი</option>
                        <option value="Admin">ადმინისტრატორი</option>
                      </select>

                      {user.role === 'Student' && !isSelf && (
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user.id, 'Instructor')}
                          title="ინსტრუქტორად დაწინაურება 1 დაწკაპუნებით"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all shadow-2xs hover:scale-105 shrink-0"
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>ინსტრუქტორად დაწინაურება</span>
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {user.isSubscribed ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] tracking-wide inline-flex items-center gap-1">
                        ⭐ PRO პაკეტი
                      </span>
                    ) : (
                      <span className="text-totc-gray font-medium text-[11px]">უფასო პაკეტი</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-totc-navy">
                    {user.role === 'Instructor' ? (
                      <span className="text-purple-700">{user.authoredCoursesCount} საავტორო კურსი</span>
                    ) : (
                      <span>{user.enrollmentsCount} ჩარიცხვა</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-totc-gray">
                    {new Date(user.createdAt).toLocaleDateString('ka-GE')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="მომხმარებლის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-totc-gray text-xs">
            თქვენი ძიების შესაბამისი მომხმარებლები ვერ მოიძებნა.
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminUsersTab;
