import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { authService } from "../services/authService";
import { setAccessToken, getAccessToken } from "../services/api";
import type {
  AuthContextValue,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";

// Context

export const AuthContext = createContext<AuthContextValue | null>(null);

// Provider

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    status: "idle", // "idle" = we haven't checked the session yet
  });

  // We need a stable ref to refreshAccessToken so the token-expired event
  // listener doesn't capture a stale closure.
  const refreshRef = useRef<() => Promise<string | null>>();

  // Silent session restore
  // On app boot we try to get a new access token using the httpOnly cookie.
  // If the cookie is absent/expired the user is simply unauthenticated.
  useEffect(() => {
    (async () => {
      setState((s) => ({ ...s, status: "loading" }));
      const result = await authService.refreshToken();

      if (result) {
        setAccessToken(result.access);
        // Fetch the user profile now that we have a valid access token
        try {
          const { api } = await import("../services/api");
          const { data: user } = await api.get("/api/auth/me/");
          setState({
            user,
            accessToken: result.access,
            status: "authenticated",
          });
        } catch {
          // Token was valid but /me/ failed — fall through to unauthenticated
          setAccessToken(null);
          setState({
            user: null,
            accessToken: null,
            status: "unauthenticated",
          });
        }
      } else {
        setState({ user: null, accessToken: null, status: "unauthenticated" });
      }
    })();
  }, []);

  // Listen for token expiry from the axios interceptor
  useEffect(() => {
    const handler = () => {
      setAccessToken(null);
      setState({ user: null, accessToken: null, status: "unauthenticated" });
    };
    window.addEventListener("auth:token-expired", handler);
    return () => window.removeEventListener("auth:token-expired", handler);
  }, []);

  // Actions

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await authService.login(credentials);
      setAccessToken(data.access);
      setState({
        user: data.user,
        accessToken: data.access,
        status: "authenticated",
      });
    } catch (err) {
      setState((s) => ({ ...s, status: "unauthenticated" }));
      throw err; // re-throw so LoginPage can show the error
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState((s) => ({ ...s, status: "loading" }));
    try {
      const data = await authService.register(credentials);
      setAccessToken(data.access);
      setState({
        user: data.user,
        accessToken: data.access,
        status: "authenticated",
      });
    } catch (err) {
      setState((s) => ({ ...s, status: "unauthenticated" }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Always clear local state, even if the backend call fails
      setAccessToken(null);
      setState({ user: null, accessToken: null, status: "unauthenticated" });
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const result = await authService.refreshToken();
    if (result) {
      setAccessToken(result.access);
      setState((s) => ({ ...s, accessToken: result.access }));
      return result.access;
    }
    setAccessToken(null);
    setState({ user: null, accessToken: null, status: "unauthenticated" });
    return null;
  }, []);

  refreshRef.current = refreshAccessToken;

  // Context value

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    loginWithGoogle,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
