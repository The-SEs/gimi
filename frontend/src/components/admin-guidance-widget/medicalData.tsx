interface MedicalRow {
  label: string
  subLabel?: string
  date: string
}

interface MedicalWidgetProps {
  title: string
  rows: MedicalRow[]
  onAdd?: () => void // 🚩 Added this prop
}

export default function MedicalDataWidget({
  title,
  rows,
  onAdd,
}: MedicalWidgetProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
      <div className="bg-[#E5E7EB] px-4 md:px-6 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </h3>
        {/* 🚩 Trigger the onAdd function here */}
        <button
          onClick={onAdd}
          className="text-blue-500 text-xs font-bold hover:underline"
        >
          + New{" "}
          {title.includes("Condition")
            ? "Condition"
            : title.includes("Medication")
              ? "Medication"
              : "History"}
        </button>
      </div>

      <div className="flex flex-col divide-y divide-gray-50">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 px-4 md:px-6 py-4 items-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-gray-800">{row.label}</span>
            <span className="text-xs text-gray-400 font-medium">
              {row.subLabel || "N/A"}
            </span>
            <span className="text-xs text-gray-400 text-right">{row.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
