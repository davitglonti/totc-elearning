import { request } from './httpClient';

export const corporateInquiriesApi = {
  /**
   * Submit a new corporate / campus training inquiry (Public).
   */
  async submit(data) {
    return request('/corporate-inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Retrieve all corporate inquiries (Admin only).
   */
  async getAll(status = 'ALL') {
    const q = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/corporate-inquiries${q}`);
  },

  /**
   * Update inquiry status and admin internal notes (Admin only).
   */
  async updateStatus(id, data) {
    return request(`/corporate-inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an inquiry (Admin only).
   */
  async delete(id) {
    return request(`/corporate-inquiries/${id}`, {
      method: 'DELETE',
    });
  },
};

export default corporateInquiriesApi;
