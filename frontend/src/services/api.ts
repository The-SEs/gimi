// Central axios instance used by every service in the app.
// Access token stored in React context and lost on page refresh
// Automatically restored via the silent refresh below
// Refresh token -> httpOnly cookie set by Django. JS cannot read it.
// The browser sends it automatically on every request to /api/auth/.
// On 401: Automatically calls /api/auth/token/refresh once, retries
// original request

import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies on everu reqiest

  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Injects the in-memory access token into the authorization header
// The token is stored outside React state so the interceptor can read
// it without needing a context reference.

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | ull {
  return _accessToken;
}

api.interceptors.request.use(
  (config) => {
    // Grab token from memory, or fallback to localStorage (for Google SSO)
    const token = getAccessToken() || localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Response interceptor

let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  _failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  _failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt a silent refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/token/refresh/" &&
      originalRequest.url !== "/api/auth/logout/"
    ) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer ${token}";
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await api.post<{ access: string }>(
          "/api/auth/token/refresh/",
        );
        const newToken = data.access;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = "Bearer ${newToken}";
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        processQueue(refreshError, null);
        // Dispatch a custom event so AuthContext can update its state
        window.dispatchEvent(new CustomEvent("auth:token-expired"));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

_isRefreshing = false;
