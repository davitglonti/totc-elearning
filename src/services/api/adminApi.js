import { request } from './httpClient';

export const adminApi = {
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

  async toggleCoursePopular(courseId) {
    return request(`/admin/courses/${courseId}/toggle-popular`, {
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
};
