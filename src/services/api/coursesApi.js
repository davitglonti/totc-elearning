import { request } from './httpClient';

export const coursesApi = {
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
};

export const categoriesApi = {
  async getAll() {
    return request('/categories');
  },

  async create(data) {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return request(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

export const reviewsApi = {
  async getCourseReviews(courseId) {
    return request(`/courses/${courseId}/reviews`);
  },

  async addReview(courseId, rating, comment) {
    return request(`/courses/${courseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};
