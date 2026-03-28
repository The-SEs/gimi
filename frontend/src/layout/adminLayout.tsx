import { Outlet } from "react-router-dom"
import GIMI from "../assets/GIMI_Icon.svg"
import AdminAccount from "../components/admin-header/adminAccount.tsx"

export default function AdminLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-gray-900 bg-[#E7E9EC] overflow-x-hidden">
      <header className="flex flex-wrap items-center justify-between w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 gap-3 sm:gap-5 bg-white min-h-[80px] sm:min-h-24 border-b border-gray-200 shadow-sm">

        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <img
            src={GIMI}
            alt="GIMI Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"/>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-blue-800 leading-none truncate">
            GIMI
          </h1>
        </div>
        <div className="flex items-center shrink-0">
          <AdminAccount />
        </div>
      </header>
      <main className="flex-grow w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}