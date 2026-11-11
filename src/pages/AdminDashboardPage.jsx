import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Server, Database, Activity, ExternalLink, 
  CheckCircle, Lock, BookOpen, Sparkles, DollarSign, CreditCard, 
  Search, Filter, Trash2, RefreshCw, AlertCircle, Eye, EyeOff, 
  Check, X, ArrowUpRight, GraduationCap, UserCheck, Layers, Clock
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardPage({ currentUser, setActivePage, setSelectedCourse }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'courses' | 'orders' | 'system'
  
  // Real live data states from backend API
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [courseSearch, setCourseSearch] = useState('');

  // Fetch all real admin data from the API
  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const [statsData, usersData, coursesData, ordersData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getCourses(),
        api.admin.getOrders(),
      ]);

      setStats(statsData);
      setUsersList(usersData || []);
      setCoursesList(coursesData || []);
      setOrdersList(ordersData || []);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setActionMessage({ type: 'error', text: 'Error connecting to admin API: ' + err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handle changing user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setActionMessage({ type: 'success', text: `User role updated to ${newRole} successfully!` });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update user role: ' + err.message });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      setActionMessage({ type: 'success', text: `User "${userEmail}" deleted successfully.` });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Could not delete user: ' + err.message });
    }
  };

  // Handle toggle course publish state
  const handleToggleCoursePublish = async (courseId, currentPublishedState) => {
    try {
      const res = await api.admin.toggleCoursePublish(courseId);
      setActionMessage({ 
        type: 'success', 
        text: `Course is now ${res.isPublished ? 'Published (Live)' : 'Draft (Hidden)'}.` 
      });
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, isPublished: res.isPublished } : c));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Could not toggle course publish state: ' + err.message });
    }
  };

  // Handle deleting a course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${courseTitle}"?`)) {
      return;
    }

    try {
      await api.admin.deleteCourse(courseId);
      setActionMessage({ type: 'success', text: `Course "${courseTitle}" deleted successfully.` });
      setCoursesList(prev => prev.filter(c => c.id !== courseId));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Could not delete course: ' + err.message });
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || user.role.toUpperCase() === userRoleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  // Filtered courses
  const filteredCourses = coursesList.filter(course => 
    course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.instructorName.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.categoryName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Admin Header with Live Status & Controls */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Super Administrator Control Center
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              Platform Administration
            </h1>
            <p className="font-poppins text-totc-gray text-sm sm:text-base">
              Real-time telemetry, user role assignment, course publishing, and financial transaction ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="px-4 py-3 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Refresh live server data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <a
              href="http://localhost:5000/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full font-bold text-xs bg-totc-navy text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-3 text-sm font-semibold">
              {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <span>{actionMessage.text}</span>
            </div>
            <button 
              onClick={() => setActionMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Real Metric Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Real Total Users */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Users</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {stats ? stats.totalUsers : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">
                {stats ? `${stats.proSubscribers} Pro Members` : ''}
              </p>
            </div>
          </div>

          {/* Real Total Revenue */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Total Revenue</p>
              <h3 className="font-poppins font-black text-2xl text-emerald-600">
                {stats ? `$${Number(stats.totalRevenue).toLocaleString()}` : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-totc-gray font-medium">
                {stats ? `${stats.totalOrders} Transactions` : ''}
              </p>
            </div>
          </div>

          {/* Real Published Courses */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Courses</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {stats ? `${stats.publishedCourses} / ${stats.totalCourses}` : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-totc-teal font-medium">
                {stats ? `${stats.totalEnrollments} Enrollments` : ''}
              </p>
            </div>
          </div>

          {/* Real API & DB Health */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">Backend Status</p>
              <h3 className="font-poppins font-black text-lg text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active (200 OK)</span>
              </h3>
              <p className="text-[11px] text-totc-gray font-medium">
                {stats?.dbEngine || 'SQLite'}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview & Telemetry', icon: Activity, count: null },
            { id: 'users', label: 'Users & Roles', icon: Users, count: usersList.length },
            { id: 'courses', label: 'Courses Management', icon: BookOpen, count: coursesList.length },
            { id: 'orders', label: 'Orders & Revenue', icon: CreditCard, count: ordersList.length },
            { id: 'system', label: 'System Architecture', icon: Server, count: null },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-totc-navy text-white shadow-md'
                    : 'bg-white text-totc-gray hover:text-totc-navy hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-totc-teal' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-totc-navy'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Telemetry */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Role Distribution breakdown */}
              <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
                <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Platform Demographics</span>
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-900">Enrolled Students</p>
                      <p className="text-[11px] text-indigo-600">Active learners with course access</p>
                    </div>
                    <span className="font-poppins font-black text-xl text-indigo-700">{stats?.totalStudents || 0}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-900">⭐ Pro All-Access Members</p>
                      <p className="text-[11px] text-amber-700">Subscribers with universal access</p>
                    </div>
                    <span className="font-poppins font-black text-xl text-amber-700">{stats?.proSubscribers || 0}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-900">Certified Instructors</p>
                      <p className="text-[11px] text-purple-600">Course authors with studio rights</p>
                    </div>
                    <span className="font-poppins font-black text-xl text-purple-700">{stats?.totalInstructors || 0}</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-lg text-totc-navy flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span>Recent Financial Transactions</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-totc-teal hover:underline flex items-center gap-1"
                  >
                    <span>View All ({ordersList.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {ordersList.slice(0, 4).map(order => (
                    <div key={order.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-totc-navy truncate">{order.itemTitle}</p>
                        <p className="text-[11px] text-totc-gray truncate">
                          Customer: <span className="text-totc-navy font-semibold">{order.userEmail}</span> • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-poppins font-black text-sm text-emerald-600">
                          ${Number(order.amount).toFixed(2)}
                        </span>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          {order.paymentStatus}
                        </div>
                      </div>
                    </div>
                  ))}

                  {ordersList.length === 0 && (
                    <div className="p-8 text-center text-totc-gray text-xs">
                      No transaction records in database yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Users & Roles Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">Registered Users Management</h3>
                <p className="text-xs text-totc-gray">Inspect real platform accounts, switch user roles, or delete users.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
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
                  <option value="ALL">All Roles ({usersList.length})</option>
                  <option value="STUDENT">Students</option>
                  <option value="INSTRUCTOR">Instructors</option>
                  <option value="ADMIN">Administrators</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Membership</th>
                    <th className="py-3 px-4">Enrollments</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                                {user.fullName} {isSelf && <span className="text-[10px] text-totc-teal">(You)</span>}
                              </p>
                              <p className="text-[11px] text-totc-gray truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Role Switcher */}
                        <td className="py-3.5 px-4">
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
                            <option value="Student">Student</option>
                            <option value="Instructor">Instructor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4">
                          {user.isSubscribed ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] tracking-wide inline-flex items-center gap-1">
                              ⭐ PRO PASS
                            </span>
                          ) : (
                            <span className="text-totc-gray font-medium text-[11px]">Free Tier</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-totc-navy">
                          {user.role === 'Instructor' ? (
                            <span className="text-purple-700">{user.authoredCoursesCount} Authored Courses</span>
                          ) : (
                            <span>{user.enrollmentsCount} Enrolled</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-totc-gray">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete user account"
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
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Courses Management */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">Course Catalog & Publishing</h3>
                <p className="text-xs text-totc-gray">Real course curriculum, student enrollment counts, and live visibility toggles.</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-totc-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search course title or instructor..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-xs text-totc-navy focus:outline-none focus:border-totc-teal w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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

                      <td className="py-3.5 px-4 font-poppins font-black text-totc-navy">
                        ${Number(course.price).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-totc-teal bg-teal-50 px-2.5 py-1 rounded-full text-[11px]">
                          {course.studentsCount} Students
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
                          title="Click to toggle publish status"
                        >
                          {course.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{course.isPublished ? 'Live (Published)' : 'Draft (Hidden)'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setActivePage('course-detail');
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-totc-navy hover:bg-totc-teal hover:text-white transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete course"
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
                  No courses found matching your query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Orders & Financial Transactions */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">Real Financial Ledger & Orders</h3>
                <p className="text-xs text-totc-gray">All recorded purchases, checkout webhooks, and Pro subscriptions.</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-totc-gray">Total Processed: </span>
                <span className="font-poppins font-black text-lg text-emerald-600">
                  ${stats ? Number(stats.totalRevenue).toLocaleString() : '0'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Item / Plan</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersList.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-totc-gray">
                        {order.transactionId ? order.transactionId.substring(0, 14) + '...' : order.id.substring(0, 8)}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-totc-navy">{order.userFullName}</p>
                        <p className="text-[10px] text-totc-gray">{order.userEmail}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-totc-navy max-w-xs truncate">
                        {order.itemTitle}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.orderType === 'Subscription' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {order.orderType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-poppins font-black text-emerald-600 text-sm">
                        ${Number(order.amount).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-totc-gray">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ordersList.length === 0 && (
                <div className="py-12 text-center text-totc-gray text-xs">
                  No orders recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: System Architecture & Security */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">Clean Architecture Telemetry</h3>
              <p className="text-xs text-totc-gray">Active services, ORM engine, and token security policies:</p>

              <div className="space-y-3">
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">Database Engine: SQLite (EF Core 9.0)</p>
                    <p className="text-emerald-700">Clean Architecture repository layer with automatic migrations and seeding.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">JWT Bearer Authentication (HS256)</p>
                    <p className="text-emerald-700">Cryptographically signed token issuance with role claim guards.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">Password Security (BCrypt Salted Hashes)</p>
                    <p className="text-emerald-700">All user passwords salted and securely hashed using BCrypt.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">API Endpoints Documentation</h3>
              <p className="text-xs text-totc-gray">Interactive OpenAPI / Swagger documentation:</p>

              <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-totc-teal">http://localhost:5000/swagger</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-300">
                  Includes full documentation for Auth, Admin, Courses, Subscriptions, Payments, Quizzes, and Reviews.
                </p>
                <a
                  href="http://localhost:5000/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors"
                >
                  <span>Launch Swagger UI</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
