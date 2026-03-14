import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layout/mainLayout.tsx";

// TODO : Import pages here
import Dashboard from "../pages/dashboard/dashboard.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      // TODO : Add here inyong mga pages
    ],
  },
]);
