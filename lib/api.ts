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

function getForumLoginUrl() {
  if (typeof window === 'undefined') {
    return FORUM_LOGIN_URL;
  }
  const redirect = encodeURIComponent(window.location.href);
  return `${FORUM_LOGIN_URL}?_xfRedirect=${redirect}`;
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // On bareefers.org subdomains, redirect to forum login and return to
      // current page after auth. Guard to avoid rapid repeated redirects.
      if (typeof window !== 'undefined' && window.location.hostname.endsWith('.bareefers.org')) {
        const key = 'barcodeLoginRedirectAt';
        const now = Date.now();
        const last = Number(sessionStorage.getItem(key) || '0');
        if (now - last > 5000) {
          sessionStorage.setItem(key, String(now));
          window.location.href = getForumLoginUrl();
        }
      }
    }
    if (error.response?.status === 403) {
      // Redirect to supporting member info
      const redirect403 = 'https://www.bareefers.org/forum/threads/how-do-i-become-a-supporting-member.14130/';
      window.location.href = redirect403;
    }
    return Promise.reject(error);
  }
);
