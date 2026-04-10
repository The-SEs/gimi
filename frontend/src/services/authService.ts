// Pure API functions
// AuthContext calls these and manages state around them

import { api } from "./api"
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  TokenRefreshResponse,
} from "../types/auth"

// const BASE_URL = ... (removed)

export const authService = {
  /**
   * Email + password login
   * Returns access token + user, Backend sets refresh cookie automatically
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = {
      email: credentials.username,
      password: credentials.password,
    }

    const response = await api.post<AuthResponse>("/api/auth/login/", payload)
    return response.data
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
    }

    const response = await api.post<AuthResponse>(
      "/api/auth/registration/",
      payload,
    )
    return response.data
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
      )
      return res.data
    } catch {
      return null // Cookie missing or expired
    }
  },

  /**
   * Clears the httpOnly cookie on the backend
   * Frontend should also clear in-memory access token.
   */
  logout(): Promise<void> {
    return api.post("/api/auth/logout/").then(() => undefined)
  },

  /**
   * Redirect the browser to Google's OAuth consent screen.
   * Django handles the full flow after the consent the browser lands once
   * "/auth/callback?access=<token>" (handled by GoogleCallbackpage).
   */
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/users/google/", {
      access_token: accessToken,
    })
    return response.data
  },

  /**
   * Request a 4-digit password reset code
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post("/api/users/request-reset/", { email })
  },

  /**
   * Verify the 4-digit code
   */
  verifyPasswordResetCode: async (email: string, code: string): Promise<void> => {
    await api.post("/api/users/verify-reset/", { email, code })
  },

  /**
   * Submit the new password with the verified code
   */
  resetPassword: async (email: string, code: string, new_password: string): Promise<void> => {
    await api.post("/api/users/reset-password/", { 
      email, 
      code, 
      new_password 
    })
  },

  updateOnboardingStatus: async (data: { 
    has_accepted_disclaimers?: boolean; 
    has_completed_onboarding?: boolean; 
  }): Promise<void> => {
    await api.patch("/api/users/onboarding-status/", data)
  },
}
