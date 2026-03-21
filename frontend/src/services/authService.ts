// Pure API functions
// AuthContext calls these and manages state around them

import { api } from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  TokenRefreshResponse,
} from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const authService = {
  /**
   * Email + password login
   * Returns access token + user, Backend sets refresh cookie automatically
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await api.post<AuthResponse>("/api/auth/login/", payload);
    return response.data;
  },

  /**
   * Email + password + confirm password
   * Returns access token + user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const payload = {
      username: credentials.username,
      email: credentials.email,
      password1: credentials.password,
      password2: credentials.password_confirm,
    };

    const response = await api.post<AuthResponse>(
      "/api/auth/registration/",
      payload,
    );
    return response.data;
  },

  /**
   * Silent session restore - uses the httpOnly refresh cookie.
   * Call this once on app boot. If the cookie is valid, return a fresh access token,
   * If not (expired / first visit), return null
   */
  async refreshToken(): Promise<TokenRefreshResponse | null> {
    try {
      const res = await api.post<TokenRefreshResponse>(
        "/api/auth/token/refresh/",
      );
      return res.data;
    } catch {
      return null; // Cookie missing or expired
    }
  },

  /**
   * Clears the httpOnly cookie on the backend
   * Frontend should also clear in-memory access token.
   */
  logout(): Promise<void> {
    return api.post("/api/auth/logout/").then(() => undefined);
  },

  /**
   * Redirect the browser to Google's OAuth consent screen.
   * Django handles the full flow after the consent the browser lands once
   * "/auth/callback?access=<token>" (handled by GoogleCallbackpage).
   */
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/users/google/", {
      access_token: accessToken,
    });
    return response.data;
  },
};
