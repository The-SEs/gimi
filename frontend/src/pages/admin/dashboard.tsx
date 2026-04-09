import { Search, Funnel, ArrowUp } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { useNavigate } from "react-router-dom" // NEW

interface SafetyFlag {
  id: number
  user_id: number // Ensure your backend adds this field!
  user_name: string
  user_email: string
  flagged_text: string
  matched_phrases: string[]
  risk_level: string
  timestamp: string
}

export default function AdminDashboard() {
  const navigate = useNavigate() // NEW
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [flags, setFlags] = useState<SafetyFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const { data } = await api.get<SafetyFlag[]>("/api/safety/admin/flags/")
        setFlags(data)
      } catch (error) {
        console.error("Failed to fetch safety flags: ", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFlags()
  }, [])

  const filteredFlags = flags.filter(
    (flag) =>
      flag.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col w-full gap-4 justify-center relative">
      <div className="sticky top-2 z-20 md:static flex flex-row flex-grow justify-between items-center bg-white p-5 shadow-sm border border-gray-100 rounded-xl text-gray-400">
        <div className="flex items-center gap-3 w-full">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-md text-gray-700 bg-transparent focus:outline-none placeholder-gray-400 font-semibold"
          />
        </div>
        <Funnel className="text-gray-500 cursor-pointer" size={20} />
      </div>

      <div className="bg-white rounded-none md:rounded-xl shadow-none md:shadow-sm border-y border-x-0 md:border border-gray-200 md:border-gray-100 overflow-hidden flex flex-col w-full">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_0.8fr] w-full text-white font-black text-xl">
          <div className="bg-[#4b84f3] py-4 px-6 text-center">Name</div>
          <div className="bg-[#648bcf] py-4 px-6 text-center">Email</div>
          <div className="bg-[#9ebadc] py-4 px-6 text-center text-sm uppercase">
            Last Flagged Content
          </div>
          <div className="bg-[#ec8783] py-4 px-6 text-center">Risk</div>
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-semibold">
              Loading data...
            </div>
          ) : filteredFlags.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-semibold">
              No flags found.
            </div>
          ) : (
            filteredFlags.map((flag) => (
              <div
                key={flag.id}
                className="grid grid-cols-2 md:grid-cols-[1.5fr_2fr_2fr_0.75fr] gap-y-1 md:gap-y-0 w-full items-center border-b border-gray-200 p-4 md:py-5 hover:bg-gray-50 cursor-pointer transition-colors font-semibold"
                // REDIRECT LOGIC
                onClick={() => navigate(`/admin/guidance/${flag.user_id}`)}
              >
                <div className="text-sm text-gray-700 font-bold uppercase md:pl-6">
                  {flag.user_name}
                </div>
                <div className="text-xs md:text-sm text-gray-500 text-left md:text-center">
                  {flag.user_email}
                </div>
                <div className="col-span-2 md:col-span-1 flex justify-start md:justify-center px-4 mt-3 md:mt-0">
                  <div className="bg-[#fce3e2] text-[#c03d3f] px-4 py-2 rounded-xl text-xs font-bold border border-red-100 w-full md:w-auto">
                    <span className="line-clamp-1 italic text-center block">
                      "{flag.flagged_text}"
                    </span>
                  </div>
                </div>
                <div className="flex justify-end md:justify-center">
                  <span className="bg-[#e74643] text-white px-5 py-2 rounded-full text-xs font-black">
                    {flag.risk_level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-7 right-7 rounded-full bg-blue-600 z-50 p-3 shadow-lg flex items-center justify-center"
        >
          <ArrowUp className="text-white" size={30} />
        </button>
      )}
    </div>
  )
}
