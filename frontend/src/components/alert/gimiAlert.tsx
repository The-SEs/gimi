import { XMarkIcon } from "@heroicons/react/24/outline"

import AlertIcon from "../../assets/alertIcon.svg"
import type { ReactNode } from "react"

type GimiAlertProps = {
  title?: string
  message?: string
  actionNode?: ReactNode
  onAction?: () => void
  onClose?: () => void
  className?: string
}

export default function GimiAlert({
  title = "GIMI",
  message = "Wow, that's a lot of words. Are you okay? Do you need help?",
  actionNode,
  onClose,
  className = "",
}: GimiAlertProps) {
  return (
    <div
      className={`gimi-alert-bounce relative rounded-[22px] border border-[#efb4c1] bg-linear-to-br from-[#f7d1d9] via-[#f3c0ca] to-[#eeb0bf] p-4 text-slate-700 shadow-[0_18px_40px_rgba(216,128,151,0.3)] ${className}`.trim()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-[#dc7590] transition hover:bg-white/40"
        aria-label="Close alert"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
          <img
            src={AlertIcon}
            alt="GIMI assistant"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="pr-6">
          <p className="text-2xl font-bold tracking-wide text-[#5b63d4]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-700/80">{message}</p>

          {actionNode && (
            <div className="mt-5 flex w-full justify-center">{actionNode}</div>
          )}
        </div>
      </div>
    </div>
  )
}
