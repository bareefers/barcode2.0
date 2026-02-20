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

// Forum login URL; after login XenForo only redirects to same domain, so we open in new tab
// and ask the user to return here and refresh.
const FORUM_LOGIN_URL = 'https://bareefers.org/forum/login/';

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Try to open login in new tab so user stays on this app. If popup is blocked,
      // do NOT redirect — let the page show "Log in required" with the button; user
      // can click it (user gesture usually allows new tab) or copy the URL.
      window.open(FORUM_LOGIN_URL, '_blank', 'noopener,noreferrer');
    }
    if (error.response?.status === 403) {
      // Redirect to supporting member info
      const redirect403 = 'https://www.bareefers.org/forum/threads/how-do-i-become-a-supporting-member.14130/';
      window.location.href = redirect403;
    }
    return Promise.reject(error);
  }
);
