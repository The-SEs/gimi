// Mirrors django backend return
// If backend serializer changes, update here first

// User
export type AuthProvider = "email" | "google";

export interface User {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  date_joined: string;
  provider: AuthProvider;
  avatar: string | null;
}

// API Request payloads

export interface LoginCredentials {
  username: string; // This can be email or nickname
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

// API Response ShapesA

/**
 * Returned by POST /api/auth/login and POST /api/auth/register
 * Refresh token is NOT in this body and is set as an httpOnly cookie
 * by django and is invisible to JavaScript
 */
export interface AuthResponse {
  access: string; // JWT access token
  user: User;
}

/**
 * Returned by POST /api/auth/token/refresh
 */
export interface TokenRefreshResponse {
  access: string;
}

/**
 * Standarad error shape
 */
export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
  password_confirm?: string[];
  [key: string]: string[] | string | undefined;
}

// Auth Context
export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (googleAccessToken: string) => Promise<void>;

  // Manually refresh access token. Used by axios interceptor
  refreshAccessToken: () => Promise<string | null>;
}
