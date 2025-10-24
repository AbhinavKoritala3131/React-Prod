import axios from 'axios';


// ✅ Use environment variable if available, fallback to localhost for local dev
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081';
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ✅ Request interceptor — attach JWT except for /login
api.interceptors.request.use((config) => {
  // Skip adding Authorization header for login requests
  if (!config.url.includes('/login')) {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Response interceptor — handle JWT expiry (403), skip for /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Skip JWT handling for login endpoint
    if (requestUrl.includes('/login')) {
      return Promise.reject(error);
    }

    // Handle JWT expiration (403)
    if (status === 403) {
      console.warn('Token Error');

      // Clear JWT and redirect
      sessionStorage.removeItem('jwtToken');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
