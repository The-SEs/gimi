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
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api
      .post<AuthResponse>("/api/auth/login/", credentials)
      .then((res) => res.data);
  },

  /**
   * New user registration
   * Returns access token + user, Backend sets refresh cookie automatically
   */
  register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return api
      .post<AuthResponse>("/api/auth/register/", credentials)
      .then((res) => res.data);
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
  loginWithGoogle(): void {
    window.location.href = `${BASE_URL}/api/auth/google/`;
  },
};
