import { request, API_BASE } from './httpClient';

export const instructorApi = {
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

  async uploadMedia(file) {
    const token = localStorage.getItem('totc_token');
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/instructor/media/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errorMsg = `Media upload failed (Status ${xhr.status})`;
            try {
              const errData = JSON.parse(xhr.responseText);
              if (errData.message || errData.error) errorMsg = errData.message || errData.error;
            } catch (_) {}
            reject(new Error(errorMsg));
          }
        } catch (err) {
          reject(err);
        }
      };

      xhr.onerror = () => reject(new Error('Network connection error during file upload.'));
      xhr.send(formData);
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
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } else if (xhr.status === 413) {
            reject(new Error('Video file is too large (maximum size is 2GB).'));
          } else {
            let errorMsg = `Upload failed (Status ${xhr.status})`;
            try {
              const errData = JSON.parse(xhr.responseText);
              if (errData.message || errData.error) errorMsg = errData.message || errData.error;
            } catch (_) {}
            reject(new Error(errorMsg));
          }
        } catch (err) {
          reject(new Error(xhr.status === 413 ? 'Video file is too large.' : 'Upload failed: ' + err.message));
        }
      };

      xhr.onerror = () => reject(new Error('Network connection error during video upload. Please retry.'));
      xhr.send(formData);
    });
  },
};
