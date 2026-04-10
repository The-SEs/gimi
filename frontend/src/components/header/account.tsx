import { useEffect, useRef, useState } from "react"
import { ChevronDown, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../hooks/useAuth"

type AccountProps = {
  name?: string
}

export default function Account({ name = "Student" }: AccountProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await logout() 
      
      navigate("/", { replace: true }) 
    } finally {
      setIsLoggingOut(false)
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-6 top-6 sm:static sm:ml-2"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex items-center sm:gap-3 sm:bg-white sm:px-5 sm:py-2 sm:rounded-2xl sm:shadow-sm transition-shadow sm:hover:shadow-md"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Open account menu"
        >
          <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white sm:border-none shadow-md sm:shadow-none">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zoie"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="hidden sm:flex flex-col pr-1 text-left">
            <span className="text-xs text-gray-400 font-medium">Hello there,</span>
            <span className="text-sm font-bold text-blue-800">{name}</span>
          </div>

          <ChevronDown
            size={16}
            className={`hidden sm:block text-blue-700 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[11rem] rounded-2xl border border-blue-100 bg-white p-2 shadow-lg"
            role="menu"
            aria-label="Account menu"
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              role="menuitem"
            >
              <LogOut size={16} className="text-red-500" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
