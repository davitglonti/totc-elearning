/**
 * Generic HTTP client with automatic JWT Authorization header injection.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function request(endpoint, options = {}) {
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
