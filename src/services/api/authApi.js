import { request } from './httpClient';

export const authApi = {
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

  async register(fullName, email, password, role = 'Student', extra = {}) {
    const roleEnum = role === 'Instructor' || role === 1 ? 1 : 0;
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        password,
        role: roleEnum,
        headline: extra.headline,
        bio: extra.bio,
        education: extra.education,
        experience: extra.experience,
        website: extra.website,
        avatarUrl: extra.avatarUrl,
      }),
    });
    if (result.token) {
      localStorage.setItem('totc_token', result.token);
      localStorage.setItem('totc_user', JSON.stringify(result.user));
    }
    return result;
  },

  async googleLogin({ idToken, role = 'Student', headline, education, experience }) {
    const roleEnum = role === 'Instructor' || role === 1 ? 1 : 0;
    const result = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken,
        role: roleEnum,
        headline,
        education,
        experience,
      }),
    });
    if (result.token) {
      localStorage.setItem('totc_token', result.token);
      localStorage.setItem('totc_user', JSON.stringify(result.user));
    }
    return result;
  },

  async getAuthConfig() {
    try {
      const config = await request('/auth/config');
      const localOverride = localStorage.getItem('totc_google_client_id');
      if (localOverride) {
        config.googleClientId = localOverride;
        config.isGoogleAuthEnabled = true;
      }
      return config;
    } catch (e) {
      const localOverride = localStorage.getItem('totc_google_client_id');
      return {
        googleClientId: localOverride || '',
        isGoogleAuthEnabled: Boolean(localOverride)
      };
    }
  },

  setLocalGoogleClientId(clientId) {
    if (clientId) {
      localStorage.setItem('totc_google_client_id', clientId.trim());
    } else {
      localStorage.removeItem('totc_google_client_id');
    }
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
};

export const usersApi = {
  async getProfile() {
    return request('/users/profile');
  },
  async updateProfile(profileData) {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  async getInstructorProfile(idOrName) {
    return request(`/users/instructors/${encodeURIComponent(idOrName)}`);
  },
};
