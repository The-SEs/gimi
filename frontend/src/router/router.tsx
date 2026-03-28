import { createBrowserRouter, useNavigate } from "react-router-dom";

import MainLayout from "../layout/mainLayout.tsx";

// TODO : Import pages here
import DashboardPage from "../pages/dashboard/dashboard.tsx";
import LoginPage from "../pages/onboarding/login.tsx";
import RegisterPage from "../pages/onboarding/register.tsx";
import DisclaimersPage from "../pages/onboarding/disclaimers.tsx";
import OnboardingQuestions from "../pages/onboarding/onboarding_questions.tsx";
import ChatTestPage from "../pages/chat/chatTest.tsx"; // ONLY FOR TESTING
import JournalPage from "../pages/journal/journal.tsx";
import CanvasPage from "../pages/canvas/canvas.tsx";
import NurseAdminPage from "../pages/admin/nurse.tsx";
import AdminLayout from "../layout/adminLayout.tsx";

const RegisterWrapper = () => {
  const navigate = useNavigate();
  return <RegisterPage onBackToLogin={() => navigate("/")} />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <MainLayout />,
    children: [{ path: "/dashboard", element: <DashboardPage /> }],
    
  },
  {
    path: "/journal",
    element: <MainLayout />,
    children: [{ path: "/journal", element: <JournalPage /> }],
  },
  {
    path: "/canvas",
    element: <MainLayout />,
    children: [{ path: "", element: <CanvasPage /> }],
  },
  {
    path: "/register",
    element: <RegisterWrapper />,
  },
  {
    path: "/disclaimers",
    element: <DisclaimersPage />,
  },
  {
    path: "/onboarding-questions",
    element: <OnboardingQuestions />,
  },
  // ONLY FOR TESTING. PLEASE MOVE EVENTUALLY.
  {
    path: "/chat",
    element: <ChatTestPage />,
  },
  {
    path: "/admin/nurse",
    element: <AdminLayout />,
    children: [{ path: "/admin/nurse", element: <NurseAdminPage /> }],
  },
]);
