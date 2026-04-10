import { createBrowserRouter, useNavigate } from "react-router-dom"

import MainLayout from "../layout/mainLayout.tsx"

// TODO : Import pages here
import DashboardPage from "../pages/dashboard/dashboard.tsx"
import LoginPage from "../pages/onboarding/login.tsx"
import RegisterPage from "../pages/onboarding/register.tsx"
import DisclaimersPage from "../pages/onboarding/disclaimers.tsx"
import OnboardingQuestions from "../pages/onboarding/onboarding_questions.tsx"
import ChatTestPage from "../pages/chat/chatTest.tsx"
import JournalPage from "../pages/journal/journal.tsx"
import CanvasPage from "../pages/canvas/canvas.tsx"
import NurseAdminPage from "../pages/admin/nurse.tsx"
import SecurityAdminPage from "../pages/admin/security.tsx"
import AdminLayout from "../layout/adminLayout.tsx"
import AdminDashboard from "../pages/admin/dashboard.tsx"
import ForgotPasswordPage from "../pages/onboarding/forgot_password.tsx"
import ResourcesPage from "../pages/resources/resources.tsx"
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute.tsx"
import StudentProfilePage from "../pages/admin/guidance"

const RegisterWrapper = () => {
  const navigate = useNavigate()
  return <RegisterPage onBackToLogin={() => navigate("/")} />
}

export const router = createBrowserRouter([
  // ====================
  // PUBLIC
  // ====================
  { path: "/", element: <LoginPage /> },
  { path: "/register", element: <RegisterWrapper /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/disclaimers", element: <DisclaimersPage /> },

  // ====================
  // STUDENT
  // ====================
  {
    path: "/chat",
    element: <ChatTestPage />,
  },
  {
    path: "/onboarding-questions",
    element: (
      <RoleProtectedRoute allowedRoles={["STUDENT"]}>
        <OnboardingQuestions />
      </RoleProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <RoleProtectedRoute allowedRoles={["STUDENT"]}>
            <DashboardPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "dashboard/alerts/:id",
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "COUNSELOR"]}>
            <StudentProfilePage />{" "}
            {/* Or your specific Alert Detail component */}
          </RoleProtectedRoute>
        ),
      },
      {
        path: "journal",
        element: (
          <RoleProtectedRoute allowedRoles={["STUDENT"]}>
            <JournalPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "canvas",
        element: (
          <RoleProtectedRoute allowedRoles={["STUDENT"]}>
            <CanvasPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "resources",
        element: (
          <RoleProtectedRoute allowedRoles={["STUDENT"]}>
            <ResourcesPage />
          </RoleProtectedRoute>
        ),
      },
    ],
  },

  // ====================
  // ADMIN (NURSE, SECURITY, COUNSELOR)
  // ====================
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "COUNSELOR", "NURSE"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "nurse",
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "COUNSELOR", "NURSE"]}>
            <NurseAdminPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "security",
        element: (
          <RoleProtectedRoute
            allowedRoles={["ADMIN", "COUNSELOR", "NURSE", "SECURITY"]}
          >
            <SecurityAdminPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "guidance/:id",
        element: (
          <RoleProtectedRoute allowedRoles={["ADMIN", "COUNSELOR"]}>
            <StudentProfilePage />
          </RoleProtectedRoute>
        ),
      },
    ],
  },
])
