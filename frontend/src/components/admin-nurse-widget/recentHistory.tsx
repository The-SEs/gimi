interface HistoryEntry {
  date: string;
  title: string;
  description: string;
}

interface RecentHistoryProps {
  entries?: HistoryEntry[];
}

export default function RecentHistory({ entries = [] }: RecentHistoryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 h-[400px] flex flex-col">

      <div className="flex items-center justify-between mb-3 flex-shrink-0 border-b border-gray-50 pb-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Recent History
        </h2>
        <button className="text-blue-600 text-sm font-bold hover:underline cursor-pointer whitespace-nowrap">
          VIEW ALL
        </button>
      </div>

      <div className="overflow-y-auto flex flex-col gap-3 pr-1 pt-2">
        {entries.map((entry, i) => (
          <div key={i} className="bg-[#F8FAFC] border border-gray-100 rounded-xl px-4 py-3 flex-shrink-0 transition-all hover:shadow-sm">
            <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-tight">{entry.date}</p>
            <p className="text-lg font-bold text-gray-800 break-words leading-tight mb-1">
              {entry.title}
            </p>
            <p className="text-sm text-gray-500 break-words leading-snug">
              {entry.description}
            </p>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-10 font-medium">No recent logs found.</p>
        )}
      </div>
    </div>
  );
}