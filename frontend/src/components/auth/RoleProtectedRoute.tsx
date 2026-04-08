import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import type { UserRole } from "../../types/auth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth || auth.status === "idle" || auth.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f5f6f8]">
        <div className="text-blue-800 font-bold text-xl animate-pulse">Loading GIMI...</div>
      </div>
    );
  }

  if (auth.status === "unauthenticated" || !auth.user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const userRole = String(auth.user.role || "").toUpperCase() as UserRole;

  if (!allowedRoles.includes(userRole)) {
    if (userRole === "STUDENT") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
