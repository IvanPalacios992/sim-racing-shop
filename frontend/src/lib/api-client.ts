import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AuthResponseDto } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token storage keys
const TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "auth-refresh-token";

// Helper functions for token management
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredTokens = (token: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearStoredTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh for 401 errors
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh for auth endpoints
    const authEndpoints = ["/auth/login", "/auth/register", "/auth/refresh"];
    if (authEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      clearStoredTokens();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<AuthResponseDto>(
        `${API_URL}/auth/refresh`,
        { refreshToken }
      );

      const { token, refreshToken: newRefreshToken } = response.data;
      setStoredTokens(token, newRefreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }

      processQueue(null, token);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      clearStoredTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
