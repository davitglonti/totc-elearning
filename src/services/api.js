/**
 * TOTC Learning Management System - API Client Service
 * Connects the React frontend to the ASP.NET Core 9 Web API backend.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Generic request helper with automatic JWT Authorization header injection.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('totc_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `HTTP ${response.status}: Request failed.`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Authentication & Users
  auth: {
    async login(email, password) {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (result.token) {
        localStorage.setItem('totc_token', result.token);
        localStorage.setItem('totc_user', JSON.stringify(result.user));
      }
      return result;
    },

    async register(fullName, email, password, role = 'Student') {
      const result = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role }),
      });
      if (result.token) {
        localStorage.setItem('totc_token', result.token);
        localStorage.setItem('totc_user', JSON.stringify(result.user));
      }
      return result;
    },

    logout() {
      localStorage.removeItem('totc_token');
      localStorage.removeItem('totc_user');
    },

    getCurrentUser() {
      const userStr = localStorage.getItem('totc_user');
      return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
      return localStorage.getItem('totc_token');
    },
  },

  users: {
    async getProfile() {
      return request('/users/profile');
    },
    async updateProfile(profileData) {
      return request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
  },

  // Courses & Categories
  courses: {
    async getAll(params = {}) {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.level) query.append('level', params.level);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.page) query.append('page', params.page);
      if (params.pageSize) query.append('pageSize', params.pageSize);

      const qs = query.toString();
      return request(`/courses${qs ? `?${qs}` : ''}`);
    },

    async getById(id) {
      return request(`/courses/${id}`);
    },

    async getCategories() {
      return request('/categories');
    },
  },

  // Student Enrollments & Learning Progression
  enrollments: {
    async getMyCourses() {
      return request('/my-courses');
    },

    async enroll(courseId) {
      return request(`/courses/${courseId}/enroll`, {
        method: 'POST',
      });
    },
  },

  learning: {
    async getContent(courseId) {
      return request(`/courses/${courseId}/learn`);
    },

    async completeLesson(lessonId, lastWatchedPositionSeconds = 0, markAsComplete = true) {
      return request(`/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          lastWatchedPositionSeconds,
          markAsComplete,
        }),
      });
    },
  },

  // Reviews
  reviews: {
    async getCourseReviews(courseId) {
      return request(`/courses/${courseId}/reviews`);
    },

    async addReview(courseId, rating, comment) {
      return request(`/courses/${courseId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
    },
  },

  // Checkout & Payments
  payments: {
    async createCheckout(courseId, couponCode = null) {
      return request('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ courseId, couponCode }),
      });
    },

    async simulateWebhookSuccess(transactionId) {
      return request('/payments/webhook', {
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          eventType: 'payment.succeeded',
          status: 'Paid',
        }),
      });
    },
  },

  // Pro & Enterprise Subscriptions (All-Access Pass)
  subscriptions: {
    async subscribe(plan = 'Pro', billingCycle = 'monthly', paymentMethod = 'card') {
      const result = await request('/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify({ plan, billingCycle, paymentMethod }),
      });

      if (result.user) {
        localStorage.setItem('totc_user', JSON.stringify(result.user));
      }
      return result;
    },

    async cancel() {
      return request('/subscriptions/cancel', {
        method: 'POST',
      });
    },

    async getStatus() {
      return request('/subscriptions/status');
    },
  },
};
