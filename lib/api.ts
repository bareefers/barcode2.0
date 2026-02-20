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
      // Do not open or redirect to forum login from here — XenForo often shows
      // "Security error" when the request comes from our origin. User should
      // open bareefers.org/forum/login/ in a new tab by typing the URL or bookmark.
      // The UI shows "Log in required" with instructions.
    }
    if (error.response?.status === 403) {
      // Redirect to supporting member info
      const redirect403 = 'https://www.bareefers.org/forum/threads/how-do-i-become-a-supporting-member.14130/';
      window.location.href = redirect403;
    }
    return Promise.reject(error);
  }
);
