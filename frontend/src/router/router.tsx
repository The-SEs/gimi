import { createBrowserRouter, useNavigate } from "react-router-dom";

import MainLayout from "../layout/mainLayout.tsx";

// TODO : Import pages here
import Dashboard from "../pages/dashboard/dashboard.tsx";
import LoginPage from "../pages/onboarding/login.tsx";
import RegisterPage from "../pages/onboarding/register.tsx";

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
    path: "/register",
    element: <RegisterWrapper />, 
  },
]);