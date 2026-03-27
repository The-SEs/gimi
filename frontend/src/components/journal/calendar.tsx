import { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";

//types

type MoodState = "HP" | "SD" | "AN" | "CM";

type DailyMood    = { id: number; date: string; state: MoodState };
type JournalEntry = { id: number; title: string; content: string; created_at: string; updated_at: string; is_flagged: boolean };
type DayData      = { mood?: MoodState; entry?: JournalEntry };
type DayCell      = { day: number; ymd: string };

//constants

const MOOD_CONFIG: Record<MoodState, { color: string; bg: string; label: string }> = {
  HP: { color: "#16a34a", bg: "#dcfce7", label: "Happy"   },
  SD: { color: "#2563eb", bg: "#dbeafe", label: "Sad"     },
  AN: { color: "#d97706", bg: "#fef3c7", label: "Anxious" },
  CM: { color: "#7c3aed", bg: "#ede9fe", label: "Calm"    },
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS    = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const STAR_COLOR  = "#f59e0b";

//utils

const toYMD = (d: Date) => d.toISOString().slice(0, 10);

const toMonthPrefix = (month: number, year: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

const formatLongDate = (ymd: string) =>
  new Date(ymd + "T00:00:00").toLocaleDateString([], {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

const buildDayGrid = (month: number, year: number): DayCell[] => {
  const prefix   = toMonthPrefix(month, year);
  const firstDay = new Date(year, month, 1).getDay();
  const numDays  = new Date(year, month + 1, 0).getDate();
  const blanks   = Array.from({ length: firstDay }, (_, i): DayCell => ({ day: 0, ymd: `blank-${i}` }));
  const days     = Array.from({ length: numDays },  (_, i): DayCell => ({
    day: i + 1,
    ymd: `${prefix}-${String(i + 1).padStart(2, "0")}`,
  }));
  return [...blanks, ...days];
};

const buildDayMap = (
  moods: DailyMood[],
  entries: JournalEntry[],
  prefix: string,
): Record<string, DayData> => {
  const map: Record<string, DayData> = {};
  for (const m of moods) {
    if (m.date.startsWith(prefix))
      map[m.date] = { ...map[m.date], mood: m.state };
  }
  for (const j of entries) {
    const date = new Date(j.created_at).toLocaleDateString("en-CA");
    if (date.startsWith(prefix))
      map[date] = { ...map[date], entry: j };
  }
  return map;
};

//hooks

function useCalendarData(month: number, year: number) {
  const [dayMap,  setDayMap]  = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const prefix = toMonthPrefix(month, year);
      const [moodsRes, entriesRes] = await Promise.all([
        api.get<DailyMood[]>("/api/wellness/daily-moods/"),
        api.get<JournalEntry[]>("/api/wellness/journals"),
      ]);
      setDayMap(buildDayMap(moodsRes.data, entriesRes.data, prefix));
    } catch {
      setError("Couldn't load data.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    window.addEventListener("daily-mood:updated",    load);
    window.addEventListener("journal-entry:updated", load);
    return () => {
      window.removeEventListener("daily-mood:updated",    load);
      window.removeEventListener("journal-entry:updated", load);
    };
  }, [load]);

  return { dayMap, loading, error };
}


function JournalModal({ entry, date, onClose }: {
  entry: JournalEntry;
  date: string;
  onClose: () => void;
}) {
  const wasEdited = entry.updated_at !== entry.created_at;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">{formatLongDate(date)}</p>
            <h3 className="text-xl font-bold text-gray-800 truncate">
              {entry.title || "Untitled Entry"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: "50vh" }}>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </p>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            {wasEdited
              ? `Edited ${formatTime(entry.updated_at)}`
              : `Written ${formatTime(entry.created_at)}`}
          </p>
          {entry.is_flagged && (
            <span className="text-xs text-red-400 font-medium">⚑ Flagged</span>
          )}
        </div>
      </div>
    </div>
  );
}


export default function CalendarWidget() {
  const today    = new Date();
  const todayYMD = toYMD(today);

  const [month,    setMonth]    = useState(today.getMonth());
  const [year,     setYear]     = useState(today.getFullYear());
  const [selected, setSelected] = useState<{ entry: JournalEntry; date: string } | null>(null);

  const { dayMap, loading, error } = useCalendarData(month, year);

  const prevMonth = () =>
    month === 0 ? (setMonth(11), setYear((y) => y - 1)) : setMonth((m) => m - 1);

  const nextMonth = () =>
    month === 11 ? (setMonth(0), setYear((y) => y + 1)) : setMonth((m) => m + 1);

  const handleDayClick = (ymd: string) => {
    const entry = dayMap[ymd]?.entry;
    if (entry) setSelected({ entry, date: ymd });
  };

  const grid = buildDayGrid(month, year);

  return (
    <>
      <div className="w-full p-4 bg-white rounded-2xl select-none">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ‹
          </button>
          <div className="text-center">
            <span className="font-semibold text-gray-800 text-sm">
              {MONTH_NAMES[month]} {year}
            </span>
            {loading && <span className="block text-[10px] text-gray-400 animate-pulse">loading…</span>}
            {error   && <span className="block text-[10px] text-red-400">{error}</span>}
          </div>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ›
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {grid.map((cell) => {
            if (cell.day === 0) return <div key={cell.ymd} />;

            const data     = dayMap[cell.ymd];
            const moodCfg  = data?.mood ? MOOD_CONFIG[data.mood] : null;
            const hasEntry = !!data?.entry;
            const isToday  = cell.ymd === todayYMD;
            const isFuture = cell.ymd > todayYMD;

            return (
              <div key={cell.ymd} className="flex items-center justify-center py-0.5">
                <button
                  onClick={() => !isFuture && handleDayClick(cell.ymd)}
                  disabled={isFuture}
                  title={
                    isFuture  ? undefined
                    : hasEntry ? "View journal entry"
                    : moodCfg  ? `Mood: ${moodCfg.label}`
                    : undefined
                  }
                  className={`
                    relative w-8 h-8 flex items-center justify-center rounded-full
                    text-xs font-medium transition-all duration-150
                    ${isFuture ? "text-gray-300 cursor-default" : "cursor-pointer hover:opacity-80"}
                    ${isToday && !moodCfg ? "ring-2 ring-blue-300 ring-offset-1" : ""}
                  `}
                  style={moodCfg ? {
                    backgroundColor: moodCfg.bg,
                    color: moodCfg.color,
                    boxShadow: isToday ? `0 0 0 2px ${moodCfg.color}` : undefined,
                  } : {}}
                >
                  {cell.day}
                  {hasEntry && !isFuture && (
                    <span
                      className="absolute -top-0.5 -right-0.5 text-[8px] leading-none"
                      style={{ color: moodCfg?.color ?? STAR_COLOR }}
                    >
                      ★
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Legend</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(MOOD_CONFIG).map(([state, cfg]) => (
              <div key={state} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-[10px] text-gray-500">{cfg.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="text-[10px]" style={{ color: STAR_COLOR }}>★</span>
              <span className="text-[10px] text-gray-500">Journal entry</span>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <JournalModal
          entry={selected.entry}
          date={selected.date}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
