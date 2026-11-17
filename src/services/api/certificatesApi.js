import { request } from './httpClient';

export const certificatesApi = {
  async getMyCertificates() {
    return request('/certificates/my');
  },

  async getByCourse(courseId) {
    return request(`/certificates/courses/${courseId}`);
  },

  async claim(courseId) {
    return request(`/certificates/courses/${courseId}/claim`, {
      method: 'POST',
    });
  },

  async verify(hash) {
    return request(`/certificates/verify/${hash}`);
  },

  async getPublic(identifier) {
    return request(`/certificates/public/${identifier}`);
  },
};
