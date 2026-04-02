import { Search, Funnel, ArrowUp } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "../../services/api"

interface SafetyFlag {
  id: number
  user_name: string
  user_email: string
  matched_phrases: string[]
  risk_level: string
  timestamp: string
}

export default function AdminDashboard() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // New states for API data and search
  const [flags, setFlags] = useState<SafetyFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // for scrollToTop feature
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Fetch data from endpoint
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

  // Filter flags based on search bar
  const filteredFlags = flags.filter(
    (flag) =>
      flag.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col w-full gap-4 justify-center relative">
      {/* SEARCH BAR UBOS */}
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
        <Funnel
          onClick={() => {
            // TODO: filtering lofic here
          }}
          className="text-gray-500 cursor-pointer"
          size={20}
        />
      </div>
      {/* TABLE UBOS */}
      <div className="bg-white rounded-none md:rounded-xl shadow-none md:shadow-sm border-y border-x-0 md:border border-gray-200 md:border-gray-100 overflow-hidden flex flex-col w-full">
        <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_0.8fr] w-full text-white font-black text-xl">
          <div className="bg-[#4b84f3] py-4 px-6 text-center">Name</div>
          <div className="bg-[#648bcf] py-4 px-6 text-center">Email</div>
          <div className="bg-[#9ebadc] py-4 px-6 text-center">
            Keywords Detected
          </div>
          <div className="bg-[#ec8783] py-4 px-6 text-center">Risk Level</div>
        </div>

        <div className="overflow-visible max-h-none md:overflow-y-auto md:max-h-[65vh] flex flex-col">
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
                className="grid grid-cols-2 md:grid-cols-[1.5fr_2fr_2fr_0.75fr] gap-y-1 md:gap-y-0 w-full items-center border-b border-gray-200 md:border-gray-100 p-4 md:p-0 md:pl-3 md:py-5 hover:bg-gray-50 cursor-pointer transition-colors font-semibold"
                onClick={() => {
                  // TODO: student click redirect logic here
                }}
              >
                <div className="order-1 md:order-none col-span-1 md:col-span-1 text-sm text-gray-700 font-semibold md:pl-3 uppercase">
                  {flag.user_name}
                </div>

                <div className="order-3 md:order-none col-span-2 md:col-span-1 text-xs md:text-sm text-gray-500 md:text-gray-600 text-left md:text-center mt-1 md:mt-0">
                  {flag.user_email}
                </div>

                <div className="order-4 md:order-none col-span-2 md:col-span-1 flex flex-wrap justify-start md:justify-center gap-2 mt-3 md:mt-0">
                  {flag.matched_phrases.map((keyword, kIndex) => (
                    <button
                      key={kIndex}
                      className="bg-[#fce3e2] text-[#c03d3f] px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer active:bg-red-200 capitalize"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>

                <div className="order-2 md:order-none col-span-1 md:col-span-1 flex justify-end md:justify-center">
                  <span className="bg-[#e74643] text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide">
                    {flag.risk_level}
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
          className="fixed bottom-7 right-7 rounded-full bg-GIMI-blue z-50 p-3 shadow-lg md:hidden flex items-center justify-center transition-opacity hover:opacity-80 active:scale-95"
        >
          <ArrowUp className="text-white" size={30} />
        </button>
      )}
    </div>
  )
}
