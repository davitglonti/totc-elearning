import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Server, Activity, ExternalLink, 
  CheckCircle, BookOpen, DollarSign, CreditCard, 
  RefreshCw, AlertCircle, X, ArrowUpRight, CheckSquare,
  Video, Layers, Settings as SettingsIcon, Layout, Bell, Sparkles, UserPlus,
  Menu, ChevronRight, Database
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    instructorReferralShare: 80,
    platformReferralShare: 20,
    instructorOrganicShare: 60,
    platformOrganicShare: 40,
    subscriptionPoolShare: 80,
    platformSubscriptionShare: 20,
    minimumPayoutThreshold: 50,
    payoutScheduleDays: '5-10',
    refundBufferDays: 14,
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
        instructorReferralShare: globalSettings.instructorReferralShare ?? 80,
        platformReferralShare: globalSettings.platformReferralShare ?? 20,
        instructorOrganicShare: globalSettings.instructorOrganicShare ?? 60,
        platformOrganicShare: globalSettings.platformOrganicShare ?? 40,
        subscriptionPoolShare: globalSettings.subscriptionPoolShare ?? 80,
        platformSubscriptionShare: globalSettings.platformSubscriptionShare ?? 20,
        minimumPayoutThreshold: globalSettings.minimumPayoutThreshold ?? 50,
        payoutScheduleDays: globalSettings.payoutScheduleDays || '5-10',
        refundBufferDays: globalSettings.refundBufferDays ?? 14,
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

  // Categorized Navigation Suites for Clean Information Architecture
  const navGroups = [
    {
      group: 'ანალიტიკა',
      items: [
        { id: 'overview', label: 'მიმოხილვა & ტელემეტრია', icon: Activity, count: null },
      ]
    },
    {
      group: 'აკადემია & კურსები',
      items: [
        { id: 'approvals', label: 'კურსების დამტკიცება', icon: CheckSquare, count: pendingCourses.length, alert: pendingCourses.length > 0 },
        { id: 'courses', label: 'კურსების კატალოგი', icon: BookOpen, count: coursesList.length, alert: false },
        { id: 'categories', label: 'კატეგორიები', icon: Layers, count: categoriesList.length, alert: false },
      ]
    },
    {
      group: 'მომხმარებლები',
      items: [
        { id: 'users', label: 'მომხმარებლები & როლები', icon: Users, count: usersList.length, alert: false },
      ]
    },
    {
      group: 'ფინანსები',
      items: [
        { id: 'orders', label: 'შეკვეთები & შემოსავალი', icon: CreditCard, count: ordersList.length, alert: false },
      ]
    },
    {
      group: 'კონტენტი & CMS',
      items: [
        { id: 'home_cms', label: 'მთავარი გვერდის CMS', icon: Layout, count: null, alert: false },
        { id: 'membership_cms', label: 'გამოწერა & ტარიფები', icon: Sparkles, count: null, alert: false },
        { id: 'settings', label: 'საიტის პარამეტრები & 80/20 წესები', icon: SettingsIcon, count: null, alert: false },
      ]
    },
    {
      group: 'ინფრასტრუქტურა & DEVOPS',
      items: [
        { id: 'bunny', label: 'Bunny Stream CDN', icon: Video, count: null, alert: false },
        { id: 'system', label: 'სისტემის არქიტექტურა', icon: Server, count: null, alert: false },
      ]
    }
  ];

  const activeTabMeta = {
    overview: {
      title: 'მიმოხილვა და ტელემეტრია',
      category: 'ანალიტიკა',
      description: 'პლატფორმის ძირითადი მეტრიკები, როლების განაწილება და ბოლო ტრანზაქციები.',
      icon: Activity
    },
    approvals: {
      title: 'კურსების დამტკიცება და მოდერაცია',
      category: 'აკადემია & კურსები',
      description: 'ინსტრუქტორების მიერ წარმოდგენილი კურსების სილაბუსის განხილვა, ვერიფიკაცია და გამოქვეყნება.',
      icon: CheckSquare
    },
    users: {
      title: 'მომხმარებლები და როლები',
      category: 'მომხმარებლები',
      description: 'სტუდენტების, ინსტრუქტორებისა და ადმინისტრატორების მართვა, როლების მინიჭება და ახალი ინსტრუქტორის რეგისტრაცია.',
      icon: Users
    },
    courses: {
      title: 'კურსების კატალოგი',
      category: 'აკადემია & კურსები',
      description: 'ყველა შექმნილი კურსის სრული სია, სტატუსების მართვა, რედაქტირება და წაშლა.',
      icon: BookOpen
    },
    categories: {
      title: 'სწავლების კატეგორიები',
      category: 'აკადემია & კურსები',
      description: 'კურსების თემატური კატეგორიების დამატება, რედაქტირება, ხატულები და სტრუქტურირება.',
      icon: Layers
    },
    orders: {
      title: 'შეკვეთები და შემოსავალი',
      category: 'ფინანსები',
      description: 'გაყიდვების ისტორია, სტუდენტების მიერ შეძენილი კურსები და ფინანსური ნაკადები.',
      icon: CreditCard
    },
    home_cms: {
      title: 'მთავარი გვერდის CMS',
      category: 'კონტენტი & CMS',
      description: 'მთავარი გვერდის ჰერო ბანერის, სტატისტიკის, ტექსტებისა და სექციების მართვა.',
      icon: Layout
    },
    membership_cms: {
      title: 'გამოწერა & ფასების CMS',
      category: 'კონტენტი & CMS',
      description: 'All-Access სააბონენტო პაკეტების, ფასების და პირობების მართვა.',
      icon: Sparkles
    },
    settings: {
      title: 'საიტის პარამეტრები & 80/20 წესები',
      category: 'კონტენტი & CMS',
      description: 'პლატფორმის ლოგო, საკონტაქტო მონაცემები და ინსტრუქტორებთან შემოსავლის გაყოფის წესები (რეფერალი 80/20, ორგანული 60/40, საპრიზო ფონდი).',
      icon: SettingsIcon
    },
    bunny: {
      title: 'Bunny Stream CDN ინტეგრაცია',
      category: 'ინფრასტრუქტურა',
      description: 'ვიდეო ჰოსტინგის API გასაღებები, ბიბლიოთეკის ID, Pull Zone და პირდაპირი ტესტირება.',
      icon: Video
    },
    system: {
      title: 'სისტემის არქიტექტურა',
      category: 'ინფრასტრუქტურა',
      description: 'პლატფორმის სრული ტექნოლოგიური სტეკი, სერვისების ურთიერთქმედება და უსაფრთხოების ფენები.',
      icon: Server
    }
  }[activeTab] || {
    title: 'ადმინისტრირება',
    category: 'მართვის ცენტრი',
    description: '',
    icon: Shield
  };

  const CurrentTabIcon = activeTabMeta.icon;

  return (
    <div className="pt-24 pb-24 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header / Quick Switcher Bar (< lg) */}
        <div className="lg:hidden mb-6 bg-white p-4 rounded-[22px] border border-gray-100 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-totc-navy transition-all shrink-0"
              aria-label="მენიუს გახსნა"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-totc-navy text-totc-teal flex items-center justify-center font-black text-sm shrink-0">
                <CurrentTabIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeTabMeta.category}</p>
                <h2 className="text-xs sm:text-sm font-bold text-totc-navy truncate">{activeTabMeta.title}</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateInstructorOpen(true)}
              className="p-2.5 rounded-xl bg-totc-teal text-white hover:bg-[#3da8aa] transition-all shadow-sm"
              title="+ ახალი ინსტრუქტორი"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-totc-navy transition-all disabled:opacity-50"
              title="განახლება"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer / Backdrop (< lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 p-5 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-totc-navy text-totc-teal flex items-center justify-center font-black">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-black text-sm text-totc-navy">TOTC Admin Center</h3>
                    <p className="text-[10px] font-semibold text-slate-400">სუპერ ადმინისტრატორი</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list in drawer */}
              <nav className="space-y-4 flex-1">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                      {group.group}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                              isActive
                                ? 'bg-totc-navy text-white shadow-sm border-l-4 border-totc-teal'
                                : 'text-slate-600 hover:text-totc-navy hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-totc-teal' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.count !== null && item.count !== undefined && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                item.alert
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="pt-4 mt-4 border-t border-gray-100 text-[11px] text-slate-400">
                🟢 სერვერი: 200 OK ({stats?.dbEngine || 'DB'})
              </div>
            </div>
          </div>
        )}

        {/* Main 2-Column Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Left Sidebar (Sticky w-72) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">
            <div className="bg-white rounded-[26px] border border-gray-100 shadow-sm p-4 max-h-[calc(100vh-7.5rem)] overflow-y-auto flex flex-col justify-between">
              
              <div>
                {/* Brand Header */}
                <div className="p-3.5 mb-3 rounded-2xl bg-gradient-to-br from-totc-navy via-slate-900 to-totc-navy text-white shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md text-totc-teal flex items-center justify-center font-black shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">სუპერ ადმინი</span>
                      </div>
                      <h2 className="font-poppins font-black text-sm text-white truncate">
                        TOTC Admin Center
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Grouped Sidebar Navigation */}
                <nav className="space-y-4">
                  {navGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        {group.group}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map(item => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all group ${
                                isActive
                                  ? 'bg-totc-navy text-white shadow-sm border-l-4 border-totc-teal'
                                  : 'text-slate-600 hover:text-totc-navy hover:bg-slate-100/80'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                  isActive ? 'text-totc-teal' : 'text-slate-400 group-hover:text-totc-navy'
                                }`} />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.count !== null && item.count !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                  item.alert
                                    ? 'bg-amber-500 text-white animate-pulse'
                                    : isActive 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                }`}>
                                  {item.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Sidebar Footer: Server Health & Links */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-700">სერვერი: 200 OK</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{stats?.dbEngine || 'DB Live'}</span>
                </div>

                <a
                  href="http://localhost:5000/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-slate-600 hover:text-totc-navy hover:bg-slate-100 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-totc-teal" />
                    <span>Swagger API დოკუმენტაცია</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{currentUser?.email || 'admin@totc.com'}</span>
                  <span className="font-bold text-totc-teal">Admin</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Right Main Content Area (flex-1) */}
          <main className="flex-1 min-w-0 space-y-6">
            
            {/* Top Workspace Header Bar */}
            <div className="bg-white p-6 sm:p-7 rounded-[26px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-totc-teal uppercase tracking-wider">
                  <span className="text-slate-400">ადმინისტრირება</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-slate-500">{activeTabMeta.category}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-totc-teal font-extrabold">{activeTabMeta.title}</span>
                </div>
                <h1 className="font-poppins font-black text-2xl sm:text-3xl text-totc-navy flex items-center gap-3">
                  <CurrentTabIcon className="w-7 h-7 text-totc-teal shrink-0" />
                  <span>{activeTabMeta.title}</span>
                </h1>
                <p className="text-xs sm:text-sm text-totc-gray max-w-2xl">
                  {activeTabMeta.description}
                </p>
              </div>

              {/* Action Toolbar */}
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
                  <span>განახლება</span>
                </button>

                <a
                  href="http://localhost:5000/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 shrink-0"
                >
                  <span>API Swagger</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Action Alert Banner */}
            {actionMessage && (
              <div className={`p-4 rounded-2xl flex items-center justify-between border ${
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

            {/* Pending Courses Approval Alert Notification (when not already on approvals tab) */}
            {pendingCourses.length > 0 && activeTab !== 'approvals' && (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[24px] text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
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
                  onClick={() => {
                    setActiveTab('approvals');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 rounded-full font-bold text-xs bg-white text-orange-600 hover:bg-orange-50 transition-all shadow-md shrink-0 flex items-center gap-2"
                >
                  <span>განხილვა ახლავე</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* If on Overview tab, show the 4 Real Metric Stat Cards */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            )}

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <AdminOverviewTab stats={stats} ordersList={ordersList} setActiveTab={setActiveTab} />
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

          </main>
        </div>

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
