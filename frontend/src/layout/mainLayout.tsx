import { Outlet } from "react-router-dom";
import GIMI from "../assets/GIMI_Icon.svg";
import { Calendar, CircleQuestionMark } from "lucide-react";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-linear-to-b from-[#EAF3FD] to-[#95C6FD] bg-fixed">
      <header className="flex items-center justify-between w-full px-8 py-4 bg-opaque-0 min-h-24">
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

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow">
            <Calendar />
            Schedule a Consultation
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow">
            <CircleQuestionMark />
            Help & Resources
          </button>

          <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-2xl shadow-sm ml-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zoie"
                alt="Avatar"
                className="w-full h-full"
              />
            </div>

            <div className="flex flex-col pr-2">
              <span className="text-xs text-gray-400 font-medium">
                Hello there,
              </span>
              <span className="text-sm font-bold text-blue-800">
                Lorem Name
              </span>
            </div>
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
