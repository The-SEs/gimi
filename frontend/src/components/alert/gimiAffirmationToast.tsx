import { XMarkIcon } from "@heroicons/react/24/outline";

import AlertIcon from "../../assets/alertIcon.svg";

type GimiAffirmationToastProps = {
  onClose?: () => void;
  className?: string;
  title?: string;
  message?: string;
};

export default function GimiAffirmationToast({
  onClose,
  className = "",
  title = "GIMI",
  message = "Wonderful painting!",
}: GimiAffirmationToastProps) {
  return (
    <div
      className={`gimi-alert-bounce relative flex items-center gap-5 overflow-hidden rounded-[28px] border border-white/55 bg-linear-to-br from-[#d9e8ff]/95 via-[#bed7ff]/90 to-[#b3d0ff]/88 px-5 py-5 text-slate-700 shadow-[0_24px_60px_rgba(113,155,219,0.22)] backdrop-blur-md ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.55),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(134,185,255,0.22),_transparent_38%)]" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-1 text-[#3657a9] transition hover:bg-white/30"
        aria-label="Close affirmation toast"
      >
        <XMarkIcon className="h-7 w-7 stroke-[2.2]" />
      </button>

      <div className="relative z-10 flex h-[92px] w-[136px] shrink-0 items-center justify-center">
        <img
          src={AlertIcon}
          alt="GIMI affirmation"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="relative z-10 pr-10">
        <p className="text-[3rem] leading-none font-bold tracking-tight text-[#4d6286]">
          {title}
        </p>
        <p className="mt-4 text-[1.05rem] font-medium text-[#5a6f93]">
          {message}
        </p>
      </div>
    </div>
  );
}
