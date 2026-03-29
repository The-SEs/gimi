import { Outlet, useLocation } from "react-router-dom"
import GIMI from "../assets/GIMI_Icon.svg"
import AdminAccount from "../components/admin-header/adminAccount.tsx"

export default function AdminLayout() {
  const location = useLocation()
  const isSecurityRoute = location.pathname === "/admin/security"

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-[#f5f6f8] overflow-x-hidden">
      <header
        className={`flex flex-row flex-wrap items-center justify-between gap-5 bg-white ${
          isSecurityRoute
            ? "min-h-[62px] border-b border-[#cdd6e1] px-4 py-3"
            : "min-h-24 border-b border-gray-200 px-4 py-4 shadow-sm md:px-8"
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-10 shrink min-w-0">
          <img
            src={GIMI}
            alt="GIMI Logo"
            className={`object-contain ${isSecurityRoute ? "h-10 w-10" : "w-20 h-20 scale-90 sm:scale-100"}`}
          />
          <h1
            className={`font-bold text-blue-800 leading-none whitespace-nowrap ${
              isSecurityRoute ? "text-[3rem]" : "text-5xl"
            }`}
          >
            GIMI
          </h1>
        </div>
        {!isSecurityRoute ? (
          <div className="flex items-center shrink-0">
            <AdminAccount/>
          </div>
        ) : null}
      </header>

      <main
        className={`flex-grow max-w-screen mx-auto w-full ${
          isSecurityRoute ? "px-2 pb-2 pt-0" : "p-6 sm:p-8"
        }`}
      >
        <Outlet/>
      </main>
    </div>
  )
}
