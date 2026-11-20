import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Server, Activity, ExternalLink, 
  CheckCircle, BookOpen, DollarSign, CreditCard, 
  RefreshCw, AlertCircle, X, ArrowUpRight, CheckSquare,
  Video, Layers, Settings as SettingsIcon, Layout, Bell, Sparkles, UserPlus
} from 'lucide-react';
import { api } from '../services/api';
import { adminApi } from '../services/api/adminApi';
import { useSettings, defaultHomeContent } from '../context/SettingsContext';

import { 
  AdminOverviewTab,
  AdminApprovalsTab,
  AdminUsersTab,
  AdminCoursesTab,
  AdminOrdersTab,
  AdminBunnyTab,
  AdminSystemTab,
  AdminCmsSettingsTab,
  AdminMembershipCmsTab,
  CourseReviewModal,
  CreateInstructorModal
} from '../components/admin';

export { CreateInstructorModal };

export default function AdminDashboardPage({ currentUser, setActivePage, setSelectedCourse }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real live data states from backend API
  const { settings: globalSettings, updateSettings: updateGlobalSettings, updateHomeContent: updateGlobalHomeContent } = useSettings();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Home CMS Form State
  const [homeCmsForm, setHomeCmsForm] = useState(globalSettings?.homeContent || defaultHomeContent);
  const [savingHomeCms, setSavingHomeCms] = useState(false);
  const [cmsSection, setCmsSection] = useState('hero');

  // Categories CRUD states
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: 'create', category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', iconUrl: '' });
  const [savingCategory, setSavingCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Site Settings & Logo form state
  const [settingsForm, setSettingsForm] = useState({
    logoUrl: '',
    siteName: 'TOTC',
    heroTitle: 'ისწავლეთ ონლაინ შეუზღუდავად',
    heroSubtitle: '',
    contactEmail: 'support@totc.edu.ge',
    contactPhone: '+995 32 200 00 00',
    footerText: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('ALL');

  // Create Instructor Modal state
  const [isCreateInstructorOpen, setIsCreateInstructorOpen] = useState(false);

  // Inspection / Review Modal for Pending Courses
  const [reviewModalCourse, setReviewModalCourse] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [rejectDialogCourse, setRejectDialogCourse] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  // Bunny Stream CDN settings
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

  // Sync settings when loaded
  useEffect(() => {
    if (globalSettings) {
      setSettingsForm({
        logoUrl: globalSettings.logoUrl || '',
        siteName: globalSettings.siteName || 'TOTC',
        heroTitle: globalSettings.heroTitle || 'ისწავლეთ ონლაინ შეუზღუდავად',
        heroSubtitle: globalSettings.heroSubtitle || 'TOTC არის თანამედროვე საგანმანათლებლო პლატფორმა, რომელიც აერთიანებს ონლაინ და ფიზიკურ სწავლებას.',
        contactEmail: globalSettings.contactEmail || 'support@totc.edu.ge',
        contactPhone: globalSettings.contactPhone || '+995 32 200 00 00',
        footerText: globalSettings.footerText || 'ვირტუალური საკლასო ოთახი და ონლაინ განათლების სისტემა',
      });
      if (globalSettings.homeContent) {
        setHomeCmsForm(globalSettings.homeContent);
      }
    }
  }, [globalSettings]);

  // Fetch all real admin data from the API
  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const [statsData, usersData, coursesData, ordersData, categoriesData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getCourses(),
        api.admin.getOrders(),
        api.categories.getAll(),
      ]);

      setStats(statsData);
      setUsersList(usersData || []);
      setCoursesList(coursesData || []);
      setOrdersList(ordersData || []);
      setCategoriesList(categoriesData || []);
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
      await api.admin.updateBunnyConfig(bunnyConfig);
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

  // Inspect full course curriculum
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

  // Handle course approval
  const handleApproveCourse = async (courseId, courseTitle) => {
    try {
      await api.admin.approveCourse(courseId);
      setActionMessage({ type: 'success', text: `✓ კურსი „${courseTitle}“ წარმატებით დამტკიცდა და გამოქვეყნდა კატალოგში!` });
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, approvalStatus: 'Approved', isPublished: true } : c));
      setReviewModalCourse(null);
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კურსის დამტკიცება ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle course rejection
  const handleConfirmReject = async () => {
    if (!rejectDialogCourse) return;
    try {
      await api.admin.rejectCourse(rejectDialogCourse.id, rejectionFeedback);
      setActionMessage({ type: 'success', text: `კურსი „${rejectDialogCourse.title}“ უარყოფილია და ინსტრუქტორს გაეგზავნა შენიშვნები.` });
      setCoursesList(prev => prev.map(c => c.id === rejectDialogCourse.id ? { ...c, approvalStatus: 'Rejected' } : c));
      setRejectDialogCourse(null);
      setReviewModalCourse(null);
      setRejectionFeedback('');
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კურსის უარყოფა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setActionMessage({ type: 'success', text: `მომხმარებლის როლი წარმატებით შეიცვალა (${newRole}).` });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'როლის შეცვლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ მომხმარებლის „${userEmail}“ წაშლა?`)) return;
    try {
      await api.admin.deleteUser(userId);
      setActionMessage({ type: 'success', text: `მომხმარებელი ${userEmail} წაიშალა.` });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      const updatedStats = await api.admin.getStats();
      setStats(updatedStats);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'მომხმარებლის წაშლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Handle instructor created via modal
  const handleInstructorCreated = async (createdInstructor) => {
    setActionMessage({ 
      type: 'success', 
      text: `✓ ახალი ინსტრუქტორი „${createdInstructor?.fullName || 'ინსტრუქტორი'}“ წარმატებით შეიქმნა!` 
    });
    try {
      const [statsData, usersData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
      ]);
      if (statsData) setStats(statsData);
      if (usersData) setUsersList(usersData);
    } catch (err) {
      console.warn('Could not refresh telemetry after instructor creation:', err);
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
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ კურსის „${courseTitle}“ სამუდამოდ წაშლა?`)) return;
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

  // Handle toggle course popular status
  const handleToggleCoursePopular = async (courseId, currentPopularStatus) => {
    try {
      const res = await api.admin.toggleCoursePopular(courseId);
      setCoursesList(prev => prev.map(c => c.id === courseId ? { ...c, isPopular: res.isPopular } : c));
      setActionMessage({
        type: 'success',
        text: `✓ კურსის პოპულარობის სტატუსი: ${res.isPopular ? '⭐ მონიშნულია როგორც პოპულარული (გამოდის კატალოგის სათავეში)' : 'სტანდარტული პრიორიტეტი'}.`
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'პოპულარობის სტატუსის შეცვლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Categories CRUD Handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setCategoryModal({ isOpen: true, mode: 'edit', category });
      setCategoryForm({ name: category.name, slug: category.slug, iconUrl: category.iconUrl || '' });
    } else {
      setCategoryModal({ isOpen: true, mode: 'create', category: null });
      setCategoryForm({ name: '', slug: '', iconUrl: '' });
    }
  };

  const handleSaveCategory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('გთხოვთ მიუთითოთ კატეგორიის სახელი.');
      return;
    }

    setSavingCategory(true);
    try {
      if (categoryModal.mode === 'create') {
        const created = await api.categories.create(categoryForm);
        setCategoriesList(prev => [...prev, created]);
        setActionMessage({ type: 'success', text: `✓ კატეგორია „${created.name}“ წარმატებით შეიქმნა!` });
      } else {
        const updated = await api.categories.update(categoryModal.category.id, categoryForm);
        setCategoriesList(prev => prev.map(c => c.id === updated.id ? updated : c));
        setActionMessage({ type: 'success', text: `✓ კატეგორია „${updated.name}“ წარმატებით განახლდა!` });
      }
      setCategoryModal({ isOpen: false, mode: 'create', category: null });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კატეგორიის შენახვა ვერ მოხერხდა: ' + err.message });
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ კატეგორიის „${catName}“ წაშლა?`)) return;
    try {
      await api.categories.delete(catId);
      setCategoriesList(prev => prev.filter(c => c.id !== catId));
      setActionMessage({ type: 'success', text: `✓ კატეგორია „${catName}“ წარმატებით წაიშალა.` });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'კატეგორიის წაშლა ვერ მოხერხდა: ' + err.message });
    }
  };

  // Site Settings & Logo Save Handler
  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingSettings(true);
    try {
      await updateGlobalSettings(settingsForm);
      setActionMessage({ 
        type: 'success', 
        text: '✓ საიტის პარამეტრები და ლოგო წარმატებით განახლდა! ცვლილებები მყისიერად აისახა ნავბარში, ფუტერსა და სისტემაში.' 
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'პარამეტრების განახლება ვერ მოხერხდა: ' + err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  // Home CMS Save & Reset Handlers
  const handleSaveHomeCms = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingHomeCms(true);
    try {
      const res = await updateGlobalHomeContent(homeCmsForm);
      if (res) {
        setActionMessage({
          type: 'success',
          text: '✓ მთავარი გვერდის შიგთავსი წარმატებით განახლდა და მომენტალურად აისახა!'
        });
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        setActionMessage({
          type: 'error',
          text: 'მთავარი გვერდის შენახვა ვერ მოხერხდა.'
        });
      }
    } catch (err) {
      console.error('Home CMS save error:', err);
      setActionMessage({
        type: 'error',
        text: 'შეცდომა მთავარი გვერდის შენახვისას: ' + (err.message || 'დაფიქსირდა შეფერხება')
      });
    } finally {
      setSavingHomeCms(false);
    }
  };

  const handleResetHomeCms = () => {
    if (window.confirm('ნამდვილად გსურთ მთავარი გვერდის შიგთავსის საწყის (სტანდარტულ) მნიშვნელობებზე დაბრუნება?')) {
      setHomeCmsForm(defaultHomeContent);
      setActionMessage({
        type: 'success',
        text: 'საწყისი მნიშვნელობები აღდგენილია. დააჭირეთ „შენახვას“ გასააქტიურებლად.'
      });
    }
  };

  const updateNestedCms = (section, field, value) => {
    setHomeCmsForm(prev => {
      const baseSection = prev?.[section] || defaultHomeContent[section] || {};
      return {
        ...prev,
        [section]: {
          ...baseSection,
          [field]: value
        }
      };
    });
  };

  const updateDeepCms = (section, subSection, field, value) => {
    setHomeCmsForm(prev => {
      const baseSection = prev?.[section] || defaultHomeContent[section] || {};
      const baseSubSection = baseSection[subSection] || defaultHomeContent[section]?.[subSection] || {};
      return {
        ...prev,
        [section]: {
          ...baseSection,
          [subSection]: {
            ...baseSubSection,
            [field]: value
          }
        }
      };
    });
  };

  const updateArrayCms = (section, arrayName, index, field, value) => {
    setHomeCmsForm(prev => {
      const baseSection = prev?.[section] || defaultHomeContent[section] || {};
      const currentList = [...(baseSection[arrayName] || defaultHomeContent[section]?.[arrayName] || [])];
      currentList[index] = {
        ...currentList[index],
        [field]: value
      };
      return {
        ...prev,
        [section]: {
          ...baseSection,
          [arrayName]: currentList
        }
      };
    });
  };

  const updateBulletCms = (section, bulletsField, index, value) => {
    setHomeCmsForm(prev => {
      const baseSection = prev?.[section] || defaultHomeContent[section] || {};
      const currentBullets = [...(baseSection[bulletsField] || defaultHomeContent[section]?.[bulletsField] || [])];
      currentBullets[index] = value;
      return {
        ...prev,
        [section]: {
          ...baseSection,
          [bulletsField]: currentBullets
        }
      };
    });
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
              onClick={() => setIsCreateInstructorOpen(true)}
              className="px-5 py-3 rounded-full font-bold text-xs bg-totc-teal text-white hover:bg-[#3da8aa] transition-all shadow-md hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
              title="ახალი ინსტრუქტორის დამატება"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ ახალი ინსტრუქტორის დამატება</span>
            </button>

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
            { id: 'categories', label: 'კატეგორიები', icon: Layers, count: categoriesList.length, alert: false },
            { id: 'home_cms', label: 'მთავარი გვერდის CMS', icon: Layout, count: null, alert: false },
            { id: 'membership_cms', label: 'გამოწერა & ფასების CMS', icon: Sparkles, count: null, alert: false },
            { id: 'settings', label: 'საიტის პარამეტრები & ლოგო', icon: SettingsIcon, count: null, alert: false },
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

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <AdminOverviewTab stats={stats} ordersList={ordersList} />
        )}

        {/* Tab 2: Approvals */}
        {activeTab === 'approvals' && (
          <AdminApprovalsTab 
            pendingCourses={pendingCourses}
            handleOpenReviewModal={handleOpenReviewModal}
            setRejectDialogCourse={setRejectDialogCourse}
            handleApproveCourse={handleApproveCourse}
          />
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <AdminUsersTab 
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userRoleFilter={userRoleFilter}
            setUserRoleFilter={setUserRoleFilter}
            usersList={usersList}
            filteredUsers={filteredUsers}
            currentUser={currentUser}
            handleRoleChange={handleRoleChange}
            handleDeleteUser={handleDeleteUser}
            onOpenCreateInstructor={() => setIsCreateInstructorOpen(true)}
          />
        )}

        {/* Tab 4: Courses */}
        {activeTab === 'courses' && (
          <AdminCoursesTab 
            courseSearch={courseSearch}
            setCourseSearch={setCourseSearch}
            courseStatusFilter={courseStatusFilter}
            setCourseStatusFilter={setCourseStatusFilter}
            pendingCourses={pendingCourses}
            filteredCourses={filteredCourses}
            handleOpenReviewModal={handleOpenReviewModal}
            handleToggleCoursePublish={handleToggleCoursePublish}
            handleToggleCoursePopular={handleToggleCoursePopular}
            setSelectedCourse={setSelectedCourse}
            setActivePage={setActivePage}
            handleDeleteCourse={handleDeleteCourse}
          />
        )}

        {/* Tab 5: Orders */}
        {activeTab === 'orders' && (
          <AdminOrdersTab stats={stats} ordersList={ordersList} />
        )}

        {/* Tab 6: Bunny Stream CDN */}
        {activeTab === 'bunny' && (
          <AdminBunnyTab 
            bunnyConfig={bunnyConfig}
            setBunnyConfig={setBunnyConfig}
            testingBunny={testingBunny}
            handleTestBunnyConnection={handleTestBunnyConnection}
            bunnyTestResult={bunnyTestResult}
            setBunnyTestResult={setBunnyTestResult}
            savingBunny={savingBunny}
            handleSaveBunnyConfig={handleSaveBunnyConfig}
            showApiKey={showApiKey}
            setShowApiKey={setShowApiKey}
          />
        )}

        {/* Tab 7: System Architecture */}
        {activeTab === 'system' && (
          <AdminSystemTab />
        )}

        {/* Tab 8: Membership & Pricing CMS */}
        {activeTab === 'membership_cms' && (
          <AdminMembershipCmsTab setActivePage={setActivePage} />
        )}

        {/* Tabs 8, 9, 10: Categories, Home CMS, Site Settings */}
        {(activeTab === 'categories' || activeTab === 'home_cms' || activeTab === 'settings') && (
          <AdminCmsSettingsTab 
            activeTab={activeTab}
            categoriesProps={{
              categoriesList,
              categorySearch,
              setCategorySearch,
              handleOpenCategoryModal,
              handleDeleteCategory,
              categoryModal,
              setCategoryModal,
              categoryForm,
              setCategoryForm,
              handleSaveCategory,
              savingCategory
            }}
            homeCmsProps={{
              homeCmsForm,
              savingHomeCms,
              cmsSection,
              setCmsSection,
              handleSaveHomeCms,
              handleResetHomeCms,
              updateNestedCms,
              updateDeepCms,
              updateArrayCms,
              updateBulletCms,
              setActivePage
            }}
            settingsProps={{
              settingsForm,
              setSettingsForm,
              handleSaveSettings,
              savingSettings
            }}
          />
        )}

      </div>

      {/* Review Modal and Reject Feedback Dialog */}
      <CourseReviewModal 
        reviewModalCourse={reviewModalCourse}
        setReviewModalCourse={setReviewModalCourse}
        rejectDialogCourse={rejectDialogCourse}
        setRejectDialogCourse={setRejectDialogCourse}
        rejectionFeedback={rejectionFeedback}
        setRejectionFeedback={setRejectionFeedback}
        handleApproveCourse={handleApproveCourse}
        handleConfirmReject={handleConfirmReject}
      />

      {/* Create Instructor Modal */}
      <CreateInstructorModal
        isOpen={isCreateInstructorOpen}
        onClose={() => setIsCreateInstructorOpen(false)}
        onSuccess={handleInstructorCreated}
      />

    </div>
  );
}
