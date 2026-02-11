import axios from 'axios';

// API base URL - in development, this will proxy through Next.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
      // Redirect to login
      const redirect401 = 'https://bareefers.org/forum/login/';
      window.location.href = redirect401;
    }
    if (error.response?.status === 403) {
      // Redirect to supporting member info
      const redirect403 = 'https://www.bareefers.org/forum/threads/how-do-i-become-a-supporting-member.14130/';
      window.location.href = redirect403;
    }
    return Promise.reject(error);
  }
);
