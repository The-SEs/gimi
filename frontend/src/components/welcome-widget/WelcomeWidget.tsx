import welcomeIcon from "../../assets/welcome-icon.svg"
import lgWelcomeIcon from "../../assets/lg-welcome-icon.svg"
import { useEffect, useState } from "react"

type WelcomeWidgetProps = {
  className?: string
  name?: string
}
export default function WelcomeWidget({
  className = "",
  name = "Student",
}: WelcomeWidgetProps) {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })

  const [isBiggerScreen, setIsBiggerScreen] = useState(
    window.innerWidth >= 1024,
  )

  useEffect(() => {
    const handleResize = () => {
      setIsBiggerScreen(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative overflow-hidden bg-white p-6 pb-20 mb-10 mt-5 rounded-xl w-[90%] mx-auto lg:w-[55%] lg:pb-35 lg:rounded-3xl xl:w-[65%] xl:pb-35">
      <div className="flex flex-col gap-1">
        <p className="font-varela text-[#1E40AF] lg:text-[18px] lg:text-[#0C1326]">
          {formattedDate}
        </p>
        <p className="font-varela font-bold text-2xl text-[#0F172A] lg:text-[48px] lg:text-[#1E3A8A] leading-tight">
          Hi, {name}!
        </p>
        <p className="font-varela text-sm text-[#64748B] lg:text-[18px] lg:text-[#3B82F6] max-w-md">
          <span className="md:hidden">Ready for a cozy, productive day?</span>
          <span className="hidden md:inline">
            Your GIMI space is ready for some creative thoughts. Let's make
            today beautiful!
          </span>
        </p>
      </div>

      <img
        src={isBiggerScreen ? lgWelcomeIcon : welcomeIcon}
        alt=""
        className={`absolute w-16 h-16 object-contain
            ${isBiggerScreen ? "top-10 right-10 w-24 h-24" : "bottom-2 right-2 w-16 h-16"}`}
      />
    </div>
  )
}
