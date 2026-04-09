interface SafetyProps {
  data: {
    user_name: string
    risk_level: string
    ai_summary: string
    matched_phrases: string[]
    // Mocking demographics since they aren't in SafetyFlag model yet
    age?: string
    gender?: string
    pronouns?: string
  } | null
}

export default function StudentIdentityWidget({ data }: SafetyProps) {
  // 1. Loading State
  if (!data)
    return <div className="h-64 bg-gray-50 animate-pulse rounded-2xl" />

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {data.user_name}
        </h2>
        <button className="text-gray-400 text-sm underline underline-offset-4">
          Edit Profile
        </button>
      </div>

      <div className="text-sm text-gray-600 leading-relaxed">
        <p className="mb-2">
          Student assessment based on{" "}
          <span className="font-bold text-[#844250]">GIMI AI analysis</span>:
        </p>
        <div className="bg-[#f0f7ff] p-4 rounded-xl border border-blue-100 text-gray-700 italic mb-3">
          "{data.ai_summary}"
        </div>
        <p>Keywords triggering this alert:</p>
      </div>

      {/* DYNAMIC KEYWORDS */}
      <div className="flex flex-wrap gap-2 p-3 md:p-4 bg-[#F3F4F6] rounded-xl border border-gray-100">
        {data.matched_phrases.length > 0 ? (
          data.matched_phrases.map((word) => (
            <span
              key={word}
              className="bg-[#FFE2E2] text-[#844250] px-3 py-1 rounded-full text-xs font-bold border border-[#f3a9b7]"
            >
              {word}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">
            No keywords detected.
          </span>
        )}
      </div>

      {/* STATIC DEMOGRAPHICS (Connect these to User model later) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {["20 yrs old", "Female", "She/Her"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 bg-white"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Risk Level</span>
          <span
            className={`font-black uppercase ${data.risk_level.toLowerCase() === "high" ? "text-red-600" : "text-gray-700"}`}
          >
            {data.risk_level}
          </span>
        </div>
      </div>
    </div>
  )
}
