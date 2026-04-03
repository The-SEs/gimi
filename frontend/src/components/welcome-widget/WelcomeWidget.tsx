import welcomeIcon from "../../assets/welcome-icon.svg";
import lgWelcomeIcon from "../../assets/lg-welcome-icon.svg";
import { useEffect, useState } from "react";

type WelcomeWidgetProps = {
  className?: string;
  name?: string;
};
export default function WelcomeWidget({
  className = "",
  name = "Student",
}: WelcomeWidgetProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const [isBiggerScreen, setIsBiggerScreen] = useState(
    window.innerWidth >= 1024,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsBiggerScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-white font-varela p-6 pb-20 rounded-xl w-full lg:pb-35 lg:rounded-3xl ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-GIMI-blue lg:text-lg">{formattedDate}</p>
        <p className="font-bold text-2xl text-slate-900 lg:text-5xl lg:text-GIMI-blue leading-tight">
          Hi, {name}!
        </p>
        <p className="text-sm text-slate-500 lg:text-lg lg:text-blue-500 max-w-md">
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
        className={`absolute object-contain
          ${isBiggerScreen ? "top-10 right-10 w-24 h-24" : "bottom-2 right-2 w-16 h-16"}`}
      />
    </div>
  );
}
