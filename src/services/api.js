/**
 * TOTC Learning Management System - Unified API Client Service
 * Modular domain-driven architecture re-exporting client modules.
 */

import { request, API_BASE } from './api/httpClient';
import { authApi, usersApi } from './api/authApi';
import { coursesApi, categoriesApi, reviewsApi } from './api/coursesApi';
import { enrollmentsApi, learningApi, quizzesApi } from './api/learningApi';
import { instructorApi } from './api/instructorApi';
import { adminApi } from './api/adminApi';
import { certificatesApi } from './api/certificatesApi';
import { settingsApi, paymentsApi, promoCodesApi, subscriptionsApi } from './api/settingsApi';

export {
  request,
  API_BASE,
  authApi,
  usersApi,
  coursesApi,
  categoriesApi,
  reviewsApi,
  enrollmentsApi,
  learningApi,
  quizzesApi,
  instructorApi,
  adminApi,
  certificatesApi,
  settingsApi,
  paymentsApi,
  promoCodesApi,
  subscriptionsApi,
};

export const api = {
  auth: authApi,
  users: usersApi,
  courses: coursesApi,
  categories: categoriesApi,
  settings: settingsApi,
  instructor: instructorApi,
  enrollments: enrollmentsApi,
  certificates: certificatesApi,
  learning: learningApi,
  reviews: reviewsApi,
  payments: paymentsApi,
  promoCodes: promoCodesApi,
  subscriptions: subscriptionsApi,
  quizzes: quizzesApi,
  admin: adminApi,
};

export default api;
