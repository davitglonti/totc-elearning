import { request } from './httpClient';

export const enrollmentsApi = {
  async getMyCourses() {
    return request('/my-courses');
  },

  async enroll(courseId) {
    return request(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  },
};

export const learningApi = {
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
};

export const quizzesApi = {
  async getByLesson(lessonId) {
    return request(`/quizzes/lesson/${lessonId}`);
  },

  async submit(quizId, answers) {
    return request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};
