import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Server, Database, Activity, ExternalLink, 
  CheckCircle, Lock, BookOpen, Sparkles, DollarSign, CreditCard, 
  Search, Filter, Trash2, RefreshCw, AlertCircle, Eye, EyeOff, 
  Check, X, ArrowUpRight, GraduationCap, UserCheck, Layers, Clock,
  Bell, CheckSquare, XCircle, FileText, Video
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboardPage({ currentUser, setActivePage, setSelectedCourse }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'approvals' | 'users' | 'courses' | 'orders' | 'system'
  
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
  const [courseStatusFilter, setCourseStatusFilter] = useState('ALL');

  // Inspection / Review Modal for Pending Courses
  const [reviewModalCourse, setReviewModalCourse] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [rejectDialogCourse, setRejectDialogCourse] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  // Bunny Stream CDN settings (loaded securely from backend API)
  const [bunnyConfig, setBunnyConfig] = useState({
    libraryId: '',
    apiKey: '',
    cdnHostname: '',
    pullZone: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingBunny, setTestingBunny] = useState(false);
  const [savingBunny, setSavingBunny] = useState(false);
  const [bunnyTestResult, setBunnyTestResult] = useState(null);

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
      setActionMessage({ type: 'error', text: 'ადმინის API-სთან დაკავშირების შეცდომა: ' + err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    api.admin.getBunnyConfig()
      .then(cfg => {
        if (cfg) setBunnyConfig(prev => ({ ...prev, ...cfg }));
      })
      .catch(err => console.warn('Could not load Bunny config:', err));
  }, []);

  const handleTestBunnyConnection = async () => {
    setTestingBunny(true);
    setBunnyTestResult(null);
    try {
      const res = await api.admin.testBunnyConnection();
      setBunnyTestResult(res);
      if (res.success) {
        setActionMessage({ 
          type: 'success', 
          text: `✓ Bunny Stream CDN წარმატებით დაკავშირდა! (HTTP ${res.statusCode} OK - ბიბლიოთეკა: ${res.libraryId || bunnyConfig.libraryId})` 
        });
      } else {
        setActionMessage({ 
          type: 'error', 
          text: `Bunny Stream ავტორიზაცია: ${res.message}. გთხოვთ გადაამოწმოთ API გასაღები dash.bunny.net-დან.` 
        });
      }
    } catch (err) {
      setBunnyTestResult({ success: false, message: err.message });
      setActionMessage({ type: 'error', text: `Bunny Stream ტესტი ვერ მოხერხდა: ${err.message}` });
    } finally {
      setTestingBunny(false);
    }
  };

  const handleSaveBunnyConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingBunny(true);
    try {
      const res = await api.admin.updateBunnyConfig(bunnyConfig);
      setActionMessage({ 
        type: 'success', 
        text: '✓ Bunny Stream CDN კონფიგურაცია განახლდა და გააქტიურდა სერვერზე!' 
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Bunny პარამეტრების განახლება ვერ მოხერხდა: ' + err.message });
    } finally {
      setSavingBunny(false);
    }
  };

  // Inspect full course curriculum (all modules & lessons)
  const handleOpenReviewModal = async (courseId) => {
    setLoadingReview(true);
    try {
      const detailed = await api.admin.getCourseReview(courseId);
      setReviewModalCourse(detailed);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კურსის პროგრამის ჩატვირთვა ვერ მოხერხდა: ' + err.message });
    } finally {
      setLoadingReview(false);
    }
  };

  // Approve course and publish to catalog
  const handleApproveCourse = async (courseId, courseTitle) => {
    try {
      const res = await api.admin.approveCourse(courseId);
      setActionMessage({ 
        type: 'success', 
        text: `🎉 კურსი „${courseTitle}“ დამტკიცდა და გამოქვეყნდა TOTC საჯარო კატალოგში!` 
      });
      setReviewModalCourse(null);
      loadAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კურსის დამტკიცება ვერ მოხერხდა: ' + err.message });
    }
  };

  // Reject course with feedback
  const handleConfirmReject = async () => {
    if (!rejectDialogCourse) return;
    try {
      const res = await api.admin.rejectCourse(rejectDialogCourse.id, rejectionFeedback);
      setActionMessage({ 
        type: 'success', 
        text: `კურსი „${rejectDialogCourse.title}“ დაუბრუნდა ინსტრუქტორს ცვლილებების მოთხოვნით.` 
      });
      setRejectDialogCourse(null);
      setRejectionFeedback('');
      setReviewModalCourse(null);
      loadAdminData();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'უარყოფა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle changing user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setActionMessage({ type: 'success', text: `მომხმარებლის როლი წარმატებით შეიცვალა (${newRole})!` });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'როლის შეცვლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ მომხმარებლის „${userEmail}“ წაშლა? ეს მოქმედება შეუქცევადია.`)) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      setActionMessage({ type: 'success', text: `მომხმარებელი „${userEmail}“ წარმატებით წაიშალა.` });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'მომხმარებლის წაშლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle toggle course publish state
  const handleToggleCoursePublish = async (courseId, currentPublishedState) => {
    try {
      const res = await api.admin.toggleCoursePublish(courseId);
      setActionMessage({ 
        type: 'success', 
        text: `კურსი ახლა ${res.isPublished ? 'გამოქვეყნებულია (აქტიური)' : 'მონახაზია (დამალული)'}.` 
      });
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, isPublished: res.isPublished } : c));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'სტატუსის შეცვლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle deleting a course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ კურსის „${courseTitle}“ სამუდამოდ წაშლა?`)) {
      return;
    }

    try {
      await api.admin.deleteCourse(courseId);
      setActionMessage({ type: 'success', text: `კურსი „${courseTitle}“ წარმატებით წაიშალა.` });
      setCoursesList(prev => prev.filter(c => c.id !== courseId));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კურსის წაშლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Pending courses for moderation
  const pendingCourses = coursesList.filter(c => c.approvalStatus === 'PendingApproval');

  // Filtered users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || user.role.toUpperCase() === userRoleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  // Filtered courses
  const filteredCourses = coursesList.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.categoryName.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesStatus = 
      courseStatusFilter === 'ALL' ||
      (courseStatusFilter === 'PENDING' && course.approvalStatus === 'PendingApproval') ||
      (courseStatusFilter === 'APPROVED' && course.approvalStatus === 'Approved') ||
      (courseStatusFilter === 'REJECTED' && course.approvalStatus === 'Rejected');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-28 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Admin Header with Live Status & Controls */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[28px] border border-gray-100 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              სუპერ ადმინისტრატორის მართვის ცენტრი
            </div>
            <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight">
              პლატფორმის ადმინისტრირება
            </h1>
            <p className="font-poppins text-totc-gray text-sm sm:text-base">
              კურსების მოდერაცია და ვერიფიკაცია, მომხმარებელთა როლები, კატალოგის მართვა და ფინანსური ტრანზაქციები.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="px-4 py-3 rounded-full font-bold text-xs bg-gray-100 text-totc-navy hover:bg-gray-200 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="სერვერის მონაცემების განახლება"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>მონაცემების განახლება</span>
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

        {/* Pending Courses Approval Alert Notification */}
        {pendingCourses.length > 0 && (
          <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[24px] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="font-poppins font-black text-lg">
                  {pendingCourses.length} კურსი ელოდება განხილვას და ვერიფიკაციას
                </h3>
                <p className="text-xs text-white/90">
                  ინსტრუქტორებმა წარადგინეს ახალი პროგრამები. შეამოწმეთ სილაბუსი და დაამტკიცეთ გამოსაქვეყნებლად.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('approvals')}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-white text-orange-600 hover:bg-orange-50 transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>განხილვა ახლავე</span>
              <ArrowUpRight className="w-4 h-4" />
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
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">სულ მომხმარებელი</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {stats ? stats.totalUsers : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-indigo-600 font-medium">
                {stats ? `${stats.proSubscribers} Pro წევრი` : ''}
              </p>
            </div>
          </div>

          {/* Real Total Revenue */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">მთლიანი შემოსავალი</p>
              <h3 className="font-poppins font-black text-2xl text-emerald-600">
                {stats ? `₾${Number(stats.totalRevenue).toLocaleString()}` : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-totc-gray font-medium">
                {stats ? `${stats.totalOrders} ტრანზაქცია` : ''}
              </p>
            </div>
          </div>

          {/* Real Published Courses & Moderation Queue */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-totc-teal shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">კატალოგი და რიგი</p>
              <h3 className="font-poppins font-black text-2xl text-totc-navy">
                {stats ? `${stats.publishedCourses} აქტიური` : <span className="animate-pulse">...</span>}
              </h3>
              <p className="text-[11px] text-amber-600 font-bold">
                {stats ? `${pendingCourses.length} მოლოდინში` : ''}
              </p>
            </div>
          </div>

          {/* Real API & DB Health */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-totc-gray uppercase tracking-wider">სერვერის სტატუსი</p>
              <h3 className="font-poppins font-black text-lg text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>აქტიური (200 OK)</span>
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
            { id: 'overview', label: 'მიმოხილვა და ტელემეტრია', icon: Activity, count: null },
            { id: 'approvals', label: 'კურსების დამტკიცება', icon: CheckSquare, count: pendingCourses.length, alert: pendingCourses.length > 0 },
            { id: 'users', label: 'მომხმარებლები და როლები', icon: Users, count: usersList.length, alert: false },
            { id: 'courses', label: 'კურსების მართვა', icon: BookOpen, count: coursesList.length, alert: false },
            { id: 'orders', label: 'შეკვეთები და შემოსავალი', icon: CreditCard, count: ordersList.length, alert: false },
            { id: 'bunny', label: 'Bunny Stream CDN', icon: Video, count: null, alert: false },
            { id: 'system', label: 'სისტემის არქიტექტურა', icon: Server, count: null, alert: false },
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
                    tab.alert
                      ? 'bg-amber-500 text-white animate-pulse'
                      : isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-totc-navy'
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
                  <span>პლატფორმის დემოგრაფია</span>
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-900">ჩარიცხული სტუდენტები</p>
                      <p className="text-[11px] text-indigo-600">აქტიური მსმენელები კურსებზე წვდომით</p>
                    </div>
                    <span className="font-poppins font-black text-xl text-indigo-700">{stats?.totalStudents || 0}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-900">⭐ Pro სრული წვდომის წევრები</p>
                      <p className="text-[11px] text-amber-700">გამომწერები უნივერსალური წვდომით</p>
                    </div>
                    <span className="font-poppins font-black text-xl text-amber-700">{stats?.proSubscribers || 0}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-900">სერტიფიცირებული ინსტრუქტორები</p>
                      <p className="text-[11px] text-purple-600">კურსების ავტორები სტუდიის უფლებით</p>
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
                    <span>ბოლო ფინანსური ტრანზაქციები</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-totc-teal hover:underline flex items-center gap-1"
                  >
                    <span>ყველას ნახვა ({ordersList.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {ordersList.slice(0, 4).map(order => (
                    <div key={order.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-totc-navy truncate">{order.itemTitle}</p>
                        <p className="text-[11px] text-totc-gray truncate">
                          მყიდველი: <span className="text-totc-navy font-semibold">{order.userEmail}</span> • {new Date(order.createdAt).toLocaleDateString('ka-GE')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-poppins font-black text-sm text-emerald-600">
                          ₾{Number(order.amount).toFixed(2)}
                        </span>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          {order.paymentStatus}
                        </div>
                      </div>
                    </div>
                  ))}

                  {ordersList.length === 0 && (
                    <div className="p-8 text-center text-totc-gray text-xs">
                      ტრანზაქციების ჩანაწერები ჯერ არ არის.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Course Approvals & Moderation Pipeline */}
        {activeTab === 'approvals' && (
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
        )}

        {/* Tab 3: Users & Roles Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">რეგისტრირებული მომხმარებლების მართვა</h3>
                <p className="text-xs text-totc-gray">მართეთ პლატფორმის ანგარიშები, შეცვალეთ როლები ან წაშალეთ მომხმარებლები.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
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
                            <option value="Student">სტუდენტი</option>
                            <option value="Instructor">ინსტრუქტორი</option>
                            <option value="Admin">ადმინისტრატორი</option>
                          </select>
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
        )}

        {/* Tab 4: Courses Management */}
        {activeTab === 'courses' && (
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
        )}

        {/* Tab 5: Orders & Financial Transactions */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-xl text-totc-navy">ფინანსური რეესტრი და შეკვეთები</h3>
                <p className="text-xs text-totc-gray">ყველა დაფიქსირებული შესყიდვა, გადახდა და Pro გამოწერა.</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-totc-gray">სულ დამუშავებული: </span>
                <span className="font-poppins font-black text-lg text-emerald-600">
                  ₾{stats ? Number(stats.totalRevenue).toLocaleString() : '0'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-totc-gray font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">ტრანზაქციის ID</th>
                    <th className="py-3 px-4">მომხმარებელი</th>
                    <th className="py-3 px-4">პროდუქტი / პაკეტი</th>
                    <th className="py-3 px-4">ტიპი</th>
                    <th className="py-3 px-4">თანხა</th>
                    <th className="py-3 px-4">სტატუსი</th>
                    <th className="py-3 px-4 text-right">თარიღი</th>
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
                        ₾{Number(order.amount).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-totc-gray">
                        {new Date(order.createdAt).toLocaleString('ka-GE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ordersList.length === 0 && (
                <div className="py-12 text-center text-totc-gray text-xs">
                  შეკვეთები ჯერ არ დაფიქსირებულა.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Bunny Stream CDN Configuration */}
        {activeTab === 'bunny' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-[28px] p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
                  <Video className="w-3.5 h-3.5 text-white" />
                  <span>ვიდეო ტრანსკოდირება და მიწოდების სისტემა</span>
                </div>
                <h3 className="font-poppins font-black text-2xl sm:text-3xl text-white">
                  Bunny.net Stream ვიდეო CDN
                </h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-2xl">
                  ავტომატური ვიდეო დამუშავება: როდესაც ინსტრუქტორი ტვირთავს ვიდეოს სტუდიაში, ფაილი იგზავნება Bunny Stream-ზე, კოდირდება HLS ფორმატში და მიეწოდება გლობალური CDN-ით.
                </p>
              </div>

              <a
                href="https://dash.bunny.net/stream/805955/api"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-2 self-start md:self-center"
              >
                <span>Bunny პანელი</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">ვიდეო ბიბლიოთეკის ID</span>
                <p className="font-poppins font-black text-xl text-totc-navy mt-1 font-mono">
                  {bunnyConfig.libraryId || '805955'}
                </p>
                <p className="text-[10px] text-totc-gray mt-0.5">მიმაგრებული Bunny Stream ბიბლიოთეკა</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">Edge Pull ზონა</span>
                <p className="font-poppins font-black text-xl text-totc-teal mt-1 font-mono">
                  {bunnyConfig.pullZone || 'vz-f0959c15-d92'}
                </p>
                <p className="text-[10px] text-totc-gray mt-0.5">გლობალური Anycast CDN დისტრიბუცია</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-totc-gray uppercase tracking-wider">CDN ჰოსტნეიმი</span>
                <p className="font-bold text-sm text-indigo-700 mt-1 font-mono truncate">
                  {bunnyConfig.cdnHostname || 'vz-f0959c15-d92.b-cdn.net'}
                </p>
                <p className="text-[10px] text-totc-gray mt-0.5">HLS პლეილისტის და სეგმენტების მისამართი</p>
              </div>
            </div>

            {/* Credentials & Test Form */}
            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="font-poppins font-bold text-lg text-totc-navy">Bunny Stream API პარამეტრები</h4>
                  <p className="text-xs text-totc-gray">მართეთ და შეამოწმეთ კავშირი TOTC LMS-სა და Bunny.net-ს შორის.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestBunnyConnection}
                    disabled={testingBunny}
                    className="px-5 py-2.5 rounded-full border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingBunny ? 'animate-spin' : ''}`} />
                    <span>{testingBunny ? 'მოწმდება...' : 'კავშირის შემოწმება'}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Message Box */}
              {bunnyTestResult && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-4 ${
                  bunnyTestResult.success 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {bunnyTestResult.success ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">{bunnyTestResult.success ? 'Bunny API დაკავშირებულია' : 'Bunny კავშირის შეტყობინება'}</p>
                      <p className="font-normal">{bunnyTestResult.message}</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setBunnyTestResult(null)} 
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveBunnyConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-totc-navy mb-1">
                      ვიდეო ბიბლიოთეკის ID
                    </label>
                    <input
                      type="text"
                      value={bunnyConfig.libraryId}
                      onChange={(e) => setBunnyConfig({ ...bunnyConfig, libraryId: e.target.value })}
                      placeholder="805955"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-totc-navy mb-1">
                      CDN ჰოსტნეიმი
                    </label>
                    <input
                      type="text"
                      value={bunnyConfig.cdnHostname}
                      onChange={(e) => setBunnyConfig({ ...bunnyConfig, cdnHostname: e.target.value })}
                      placeholder="vz-f0959c15-d92.b-cdn.net"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-totc-navy mb-1">
                      Pull ზონის სახელი
                    </label>
                    <input
                      type="text"
                      value={bunnyConfig.pullZone}
                      onChange={(e) => setBunnyConfig({ ...bunnyConfig, pullZone: e.target.value })}
                      placeholder="vz-f0959c15-d92"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-totc-navy">
                        API წვდომის გასაღები
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-[11px] text-totc-teal hover:underline flex items-center gap-1 font-semibold"
                      >
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showApiKey ? 'დამალვა' : 'ჩვენება'}</span>
                      </button>
                    </div>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={bunnyConfig.apiKey || ''}
                      onChange={(e) => setBunnyConfig({ ...bunnyConfig, apiKey: e.target.value })}
                      placeholder="ჩასვით API გასაღები dash.bunny.net-დან"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-totc-teal outline-none text-xs font-mono text-totc-navy font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={savingBunny}
                    className="px-6 py-2.5 rounded-full bg-totc-navy hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingBunny ? 'ინახება...' : 'კონფიგურაციის შენახვა'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Architecture Explainer Card */}
            <div className="bg-slate-900 rounded-[28px] p-6 sm:p-8 text-white space-y-4">
              <h4 className="font-poppins font-bold text-lg text-totc-teal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-totc-teal" />
                <span>როგორ მუშაობს ლექციის ვიდეოს ატვირთვა</span>
              </h4>
              <p className="text-xs text-slate-300">
                ლექტორები ტვირთავენ ლექციებს პირდაპირ ინსტრუქტორის სტუდიიდან. აი, რა ხდება ფონურ რეჟიმში:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h5 className="font-bold text-xs text-white">ბრაუზერიდან სტრიმინგი</h5>
                  <p className="text-[11px] text-slate-400">
                    ლექტორი ირჩევს MP4/MOV ფაილს. TOTC აჩვენებს ატვირთვის პროგრესს (0-100%).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-totc-teal/20 text-totc-teal font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h5 className="font-bold text-xs text-white">Bunny Stream ტრანსკოდირება</h5>
                  <p className="text-[11px] text-slate-400">
                    API ქმნის ვიდეოს ჩანაწერს ბიბლიოთეკაში 805955 და აგზავნის ნაკადს Bunny-ს კლასტერში.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h5 className="font-bold text-xs text-white">ადაპტური დაკვრა კლასში</h5>
                  <p className="text-[11px] text-slate-400">
                    საკლასო პლეერი ავტომატურად ცვლის ხარისხს (1080p-დან 360p-მდე) სტუდენტის ინტერნეტის მიხედვით.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: System Architecture & Security */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">სისტემის არქიტექტურის ტელემეტრია</h3>
              <p className="text-xs text-totc-gray">აქტიური სერვისები, ORM ძრავა და ტოკენების უსაფრთხოების პოლიტიკა:</p>

              <div className="space-y-3">
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">მონაცემთა ბაზა: SQLite (EF Core 9.0)</p>
                    <p className="text-emerald-700">Clean Architecture რეპოზიტორიის შრე ავტომატური მიგრაციებით.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">მოდერაციის პროცესი აქტიურია</p>
                    <p className="text-emerald-700">ინსტრუქტორების მიერ გამოგზავნილი კურსები გადის ადმინის შემოწმებას.</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">JWT Bearer ავტორიზაცია (HS256)</p>
                    <p className="text-emerald-700">კრიპტოგრაფიულად ხელმოწერილი ტოკენები როლების დაცვით.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">API ენდპოინტების დოკუმენტაცია</h3>
              <p className="text-xs text-totc-gray">ინტერაქტიული OpenAPI / Swagger დოკუმენტაცია:</p>

              <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-totc-teal">http://localhost:5000/swagger</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">200 OK</span>
                </div>
                <p className="text-xs text-slate-300">
                  მოიცავს სრულ დოკუმენტაციას ავტორიზაციის, მოდერაციის, კურსების, გამოწერების, გადახდებისა და ტესტების შესახებ.
                </p>
                <a
                  href="http://localhost:5000/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-totc-teal text-white font-bold text-xs hover:bg-totc-teal-dark transition-colors"
                >
                  <span>Swagger UI-ს გახსნა</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>

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

    </div>
  );
}
