import {
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  CheckCircle,
  Quote,
} from "lucide-react"

export type SafetyFlagData = {
  id: number
  student_name: string
  timestamp: string
  risk_level: "High" | "Medium" | "Low"
  matched_phrases: string[]
  flagged_text: string
  ai_summary: string
}

type Props = {
  flag: SafetyFlagData
  onReview?: (id: number) => void
}

export default function CounselorFlagCard({ flag, onReview }: Props) {
  const dateObj = flag.timestamp ? new Date(flag.timestamp) : new Date()

  // Check if parsing actually worked
  const isValidDate = !isNaN(dateObj.getTime())

  const formattedTime = isValidDate
    ? dateObj.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Recently" // Fallback text for the demo

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-200">
      {/* HEADER: Using your soft pink background and dark mauve text */}
      <div className="flex items-center justify-between border-b border-[#f3a9b7] bg-[#ffd5de]/30 px-5 py-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-[#844250]" strokeWidth={2.5} />
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              Safety Alert
              {/* Risk Badge using your pink/mauve combo */}
              <span className="rounded bg-[#ffd5de] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#844250]">
                {flag.risk_level} RISK
              </span>
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1">
                <User size={12} /> {flag.student_name}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* SECTION 1: AI Clinical Summary (Using your soft blue background) */}
        <div className="mb-5 rounded-xl border border-blue-100 bg-[#f0f7ff] p-4">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800">
            <AlertTriangle size={14} />
            System Analysis
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            {flag.ai_summary}
          </p>

          {flag.matched_phrases.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
              Trigger phrase:
              <span className="rounded bg-[#ffd5de]/50 px-2 py-0.5 text-[#844250] ring-1 ring-[#f3a9b7]">
                "{flag.matched_phrases[0]}"
              </span>
            </div>
          )}
        </div>

        {/* SECTION 2: The Exact Flagged Message */}
        <div className="relative rounded-xl border border-gray-100 bg-[#fcfdfe] p-4 shadow-sm">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Quote size={14} />
            Flagged Student Message
          </h3>
          <p className="text-sm font-medium text-gray-800 italic">
            "{flag.flagged_text}"
          </p>
        </div>
      </div>

      {/* FOOTER: Action using your primary dark mauve button style */}
      <div className="flex items-center justify-end border-t border-gray-100 bg-white px-5 py-3">
        <button
          onClick={() => onReview && onReview(flag.id)}
          className="flex items-center gap-1.5 rounded-lg bg-[#844250] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-[#6b3541] active:scale-95"
        >
          <CheckCircle size={16} />
          Mark as Reviewed
        </button>
      </div>
    </div>
  )
}
