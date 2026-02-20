import axios from 'axios';

// API base URL
// In production: use environment variable (e.g., https://bareefers.org/bc/api)
// In development: use local proxy
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://bareefers.org/bc/api');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Do not auto-redirect: show "Log in required" card with button so user
      // stays on the app. XenForo does not allow _xfRedirect to external hostnames,
      // so after login user must return to this tab and refresh.
    }
    if (error.response?.status === 403) {
      // Redirect to supporting member info
      const redirect403 = 'https://www.bareefers.org/forum/threads/how-do-i-become-a-supporting-member.14130/';
      window.location.href = redirect403;
    }
    return Promise.reject(error);
  }
);
