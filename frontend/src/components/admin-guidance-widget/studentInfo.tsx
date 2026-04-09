interface SafetyProps {
  data: any
}

export default function StudentIdentityWidget({ data }: SafetyProps) {
  if (!data)
    return <div className="h-64 bg-gray-50 animate-pulse rounded-2xl" />

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {data.user_name}
        </h2>
        <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-1 rounded-md uppercase">
          {data.risk_level} Risk
        </span>
      </div>

      <div className="text-sm text-gray-600 leading-relaxed">
        <p className="mb-2 font-bold text-gray-400 uppercase text-[10px] tracking-widest">
          Last Flagged Message
        </p>
        {/* Now showing the actual text instead of keywords */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 italic text-[#844250] font-medium leading-relaxed">
          "{data.snippet}"
        </div>
      </div>

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

      <div className="space-y-3 pt-2 border-t border-gray-50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-bold uppercase text-[10px]">
            Student Num
          </span>
          <span className="text-gray-700 font-medium">C202301020207</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 font-bold uppercase text-[10px]">
            Program
          </span>
          <span className="text-gray-700 font-medium">CSC-31</span>
        </div>
      </div>
    </div>
  )
}
