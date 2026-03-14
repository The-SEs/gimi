import { Outlet } from "react-router-dom";
import GIMI from "../assets/GIMI_Icon.svg";
import Consultation from "../components/header/consultation.tsx";
import HelpAndResources from "../components/header/resources.tsx";
import Account from "../components/header/account.tsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-linear-to-b from-[#EAF3FD] to-[#95C6FD] bg-fixed">
      <header
        header
        className="flex flex-col md:flex-row items-start md:items-center justify-between w-full px-4 md:px-8 py-4 gap-5 md:gap-0 bg-transparent min-h-24"
      >
        <div className="flex items-center gap-4">
          <img
            src={GIMI}
            alt="GIMI Logo"
            className="w-20 h-20 object-contain"
          />

          <div className="flex flex-col">
            <h1 className="text-5xl font-bold text-blue-800 tracking-wide m-0 leading-none">
              GIMI
            </h1>
            <p className="text-blue-500 text-sm font-medium mt-1">
              Welcome back to your cozy space ✨
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center w-full md:w-auto md:flex-col-reverse lg:flex-row md:items-end lg:items-center gap-3 md:gap-4">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="shrink-0">
              <Consultation />
            </div>
            <div className="shrink-0">
              <HelpAndResources />
            </div>
          </div>
          <div className="hidden md:block shrink-0">
            <Account />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-6 sm:p-8">
        <Outlet />
      </main>

      <footer className="bg-opacity-0 text-gray-500 text-sm text-center p-6">
        <p>Made with 💙 by JSE Team &copy; 2026 </p>
      </footer>
    </div>
  );
}
