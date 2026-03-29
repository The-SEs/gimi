interface HistoryEntry {
  date: string;
  title: string;
  description: string;
}

interface RecentHistoryProps {
  entries?: HistoryEntry[];
}

const defaultEntries: HistoryEntry[] = [
  {
    date: "MAR 1 • 10:00 AM",
    title: "Severe Abdominal Pain",
    description: "Student reported cramping. Vitals normal. Monitored for 30 mins, medicated pain killers.",
  },
  {
    date: "MAR 1 • 10:00 AM",
    title: "Severe Abdominal Pain",
    description: "Student reported cramping. Vitals normal. Monitored for 30 mins, medicated pain killers.",
  },
  {
    date: "MAR 1 • 10:00 AM",
    title: "Severe Abdominal Pain",
    description: "Student reported cramping. Vitals normal. Monitored for 30 mins, medicated pain killers.",
  },
  {
    date: "MAR 1 • 10:00 AM",
    title: "Severe Abdominal Pain",
    description: "Student reported cramping. Vitals normal. Monitored for 30 mins, medicated pain killers.",
  },
];

export default function RecentHistory({ entries = defaultEntries }: RecentHistoryProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 h-70 lg:h-[400px] flex flex-col">

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Recent History
        </h2>
        <button className="text-blue-600 text-sm font-medium hover:underline cursor-pointer whitespace-nowrap">
          View All
        </button>
      </div>

      <div className="overflow-y-auto flex flex-col gap-3 pr-1">
        {entries.map((entry, i) => (
          <div key={i} className="bg-gray-100 rounded-lg px-3 sm:px-4 py-3 flex-shrink-0">
            <p className="text-sm text-gray-500 mb-1">{entry.date}</p>
            <p className="text-base sm:text-xl font-bold text-gray-800 break-words">
              {entry.title}
            </p>
            <p className="text-sm sm:text-base text-gray-500 break-words leading-snug">
              {entry.description}
            </p>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-gray-400 italic">No recent history on record.</p>
        )}
      </div>
    </div>
  );
}