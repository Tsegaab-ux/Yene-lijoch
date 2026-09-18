import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const API_BASE = process.env.DJANGO_API_URL || "http://127.0.0.1:8000";

// Create a server-side API client (no localStorage)
export const serverApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true
});

// Create a client-side API client (with localStorage support)
export const clientApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Client-side request interceptor (only runs in browser)
if (typeof window !== 'undefined') {
  clientApi.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for token refresh
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  const AUTH_PATHS = ["/login/", "/register/", "/refresh/"];

  clientApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const isAuthCall = AUTH_PATHS.some((p) => originalRequest?.url?.includes(p));

      if (status !== 401 || !originalRequest || originalRequest._retry || isAuthCall) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        // Not logged in: report the original 401. No throw, no redirect.
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return clientApi(originalRequest);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/refresh/`, { refresh: refreshToken });
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh); // rotated tokens
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return clientApi(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        processQueue(refreshError, null);
        // Only redirect when a real session died, and never if already on /login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

// For backward compatibility, export a default api
export const api = clientApi;

// Token helpers
export const isClient = typeof window !== 'undefined';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("access");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("refresh");
};

export const setTokens = (access: string, refresh: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const decodeToken = (token: string): any => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

export const isTokenExpired = (token: string): boolean => {
  return !isTokenValid(token);
};

export const getTokenExpiry = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
};

export const getTokenRemainingTime = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  return decoded.exp * 1000 - Date.now();
};