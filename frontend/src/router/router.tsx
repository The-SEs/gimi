import { createBrowserRouter, useNavigate } from "react-router-dom";

import MainLayout from "../layout/mainLayout.tsx";

// TODO : Import pages here
import Dashboard from "../pages/dashboard/dashboard.tsx";
import LoginPage from "../pages/onboarding/login.tsx";
import RegisterPage from "../pages/onboarding/register.tsx";
import DisclaimersPage from "../pages/onboarding/disclaimers.tsx";
import OnboardingQuestions from "../pages/onboarding/onboarding_questions.tsx"; 
import ChatTestPage from "../pages/chat/chatTest.tsx"; // ONLY FOR TESTING

const RegisterWrapper = () => {
  const navigate = useNavigate();
  return <RegisterPage onBackToLogin={() => navigate("/login")} />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      // add other protected pages here
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/disclaimers",
    element: <DisclaimersPage />,
  },
  {
    path: "/register",
    element: <RegisterWrapper />,
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
]);

