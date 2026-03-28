import { Outlet } from "react-router-dom"
import GIMI from "../assets/GIMI_Icon.svg"
import AdminAccount from "../components/admin-header/adminAccount.tsx"

export default function AdminLayout() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col font-sans text-gray-900 bg-[#f5f6f8]">
      <header className="flex flex-row flex-wrap items-center justify-between w-full px-4 md:px-8 py-4 gap-5 bg-white min-h-24 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-10 shrink min-w-0">
          <img
            src={GIMI}
            alt="GIMI Logo"
            className="w-20 h-20 scale-90 sm:scale-100 object-contain"/>
          <h1 className="text-5xl font-bold text-blue-800 leading-none whitespace-nowrap">
            GIMI
          </h1>
        </div>
        <div className="flex items-center shrink-0">
          <AdminAccount/>
        </div>
      </header>
      <main className="flex-grow max-w-screen mx-auto w-full p-6 sm:p-8">
        <Outlet/>
      </main>
    </div>
  )
}