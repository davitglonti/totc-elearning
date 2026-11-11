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

  // Instructor Authoring & Studio
  instructor: {
    async getMyCourses() {
      return request('/instructor/my-courses');
    },

    async createFullCourse(data) {
      return request('/instructor/courses/full', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getCourseForEdit(courseId) {
      return request(`/instructor/courses/${courseId}/full`);
    },

    async updateFullCourse(courseId, data) {
      return request(`/instructor/courses/${courseId}/full`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async toggleCoursePublish(courseId) {
      return request(`/instructor/courses/${courseId}/toggle-publish`, {
        method: 'PUT',
      });
    },

    async deleteCourse(courseId) {
      return request(`/instructor/courses/${courseId}`, {
        method: 'DELETE',
      });
    },

    async uploadVideo(file, title, onProgress) {
      const token = localStorage.getItem('totc_token');
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/instructor/media/upload-video`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject(new Error(data.message || data.error || 'Video upload failed.'));
            }
          } catch (err) {
            reject(new Error('Invalid server response.'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during video upload.'));
        xhr.send(formData);
      });
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

  // Interactive Lesson Quizzes & Knowledge Checks
  quizzes: {
    async getByLesson(lessonId) {
      return request(`/quizzes/lesson/${lessonId}`);
    },

    async submit(quizId, answers) {
      return request(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    },
  },

  // Super Admin Platform Telemetry & Management
  admin: {
    async getStats() {
      return request('/admin/stats');
    },

    async getUsers() {
      return request('/admin/users');
    },

    async updateUserRole(userId, role) {
      return request(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    async deleteUser(userId) {
      return request(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    async getCourses() {
      return request('/admin/courses');
    },

    async toggleCoursePublish(courseId) {
      return request(`/admin/courses/${courseId}/toggle-publish`, {
        method: 'PUT',
      });
    },

    async deleteCourse(courseId) {
      return request(`/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
    },

    async getCourseReview(courseId) {
      return request(`/admin/courses/${courseId}/review`);
    },

    async approveCourse(courseId) {
      return request(`/admin/courses/${courseId}/approve`, {
        method: 'PUT',
      });
    },

    async rejectCourse(courseId, reason) {
      return request(`/admin/courses/${courseId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    },

    async getOrders() {
      return request('/admin/orders');
    },

    async getBunnyConfig() {
      return request('/admin/bunny-stream');
    },

    async updateBunnyConfig(config) {
      return request('/admin/bunny-stream', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    },

    async testBunnyConnection() {
      return request('/admin/bunny-stream/test', {
        method: 'POST',
      });
    },
  },
};
