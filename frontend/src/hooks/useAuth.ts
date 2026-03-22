// Convenience hook - import this anywhere instead of useContext(AuthContext).
// Throws a clear error if used outside <AuthProvider> so mistakes surface fast

import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextValue } from "../types/auth";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}
