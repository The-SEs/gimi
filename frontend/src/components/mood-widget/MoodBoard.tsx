import calmMood from "../../assets/calm-mood.svg";
import annoyedMood from "../../assets/annoyed-mood.svg";
import neutralMood from "../../assets/neutral-mood.svg";
import sadMood from "../../assets/sad-mood.svg";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

type DailyMoodState = "HP" | "SD" | "AN" | "CM";

type DailyMoodResponse = {
  id: number;
  date: string;
  updated_at: string;
  state: DailyMoodState;
};

type MoodEntry = {
  label: string;
  icon: string;
  state: DailyMoodState;
};

const MOODS: MoodEntry[] = [
  { label: "Calm",    icon: calmMood,    state: "CM" },
  { label: "Annoyed", icon: annoyedMood, state: "AN" },
  { label: "Neutral", icon: neutralMood, state: "HP" },
  { label: "Sad",     icon: sadMood,     state: "SD" },
];

const STATE_TO_MOOD: Record<DailyMoodState, MoodEntry> = Object.fromEntries(
  MOODS.map((m) => [m.state, m])
) as Record<DailyMoodState, MoodEntry>;

const todayYMD = () => new Date().toISOString().slice(0, 10);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

const extractError = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { detail?: unknown } }; message?: unknown };
  const detail = e.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof e.message === "string") return e.message;
  return fallback;
};

type SavedMood = {
  state: DailyMoodState;
  date: string;
  updatedAt: string;
};

type MoodBoardProps = {
  className?: string;
};

export default function MoodBoard({ className = "" }: MoodBoardProps) {
  const [saved, setSaved] = useState<SavedMood | null>(null);
  const [current, setCurrent] = useState<MoodEntry>(MOODS[2]); // Default: Neutral
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const applyMoodResponse = (data: DailyMoodResponse) => {
    setCurrent(STATE_TO_MOOD[data.state]);
    setSaved({
      state: data.state,
      date: data.date,
      updatedAt: data.updated_at ?? new Date().toISOString(),
    });
  };

  const loadTodayMood = async () => {
    try {
      setStatus("loading");
      const { data } = await api.get<DailyMoodResponse[]>("/api/wellness/daily-moods/");
      const todaysEntry = data.find((m) => m.date === todayYMD());
      if (todaysEntry) {
        applyMoodResponse(todaysEntry);
      } else {
        setCurrent(MOODS[2]);
        setSaved(null);
      }
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg(extractError(err, "Failed to load mood data."));
    }
  };

  useEffect(() => {
    loadTodayMood();
    window.addEventListener("daily-mood:updated", loadTodayMood);
    return () => window.removeEventListener("daily-mood:updated", loadTodayMood);
  }, []);

  const handleMoodSelection = async (mood: MoodEntry) => {
    setErrorMsg("");
    if (saving) return;

    const isLoggedToday = saved?.date === todayYMD();
    if (isLoggedToday && saved?.state === mood.state) return;
    if (isLoggedToday && !window.confirm("Are you sure you want to change your mood for the day?")) return;

    try {
      setSaving(true);
      const { data } = await api.post<DailyMoodResponse>("/api/wellness/daily-moods/", {
        state: mood.state,
      });
      applyMoodResponse(data);
    } catch (err) {
      setErrorMsg(extractError(err, "Failed to save mood."));
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className={`relative w-[90%] mx-auto mt-5 lg:w-[40%] xl:w-[30%] ${className}`}>
        <div className="bg-white py-5 px-7 rounded-3xl flex flex-col gap-4 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-gray-100 rounded" />
          <div className="h-24 bg-gray-50 rounded-xl" />
          <div className="h-10 bg-gray-50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-3 left-3/4 -translate-x-1/4 w-20 h-6 bg-blue-300/40 backdrop-blur-[1px] border-l border-r border-white/20 -rotate-2 shadow-sm z-10" />
      <div className="bg-white py-5 px-7 rounded-3xl flex flex-col gap-4 shadow-sm">
        <h2 className="text-2xl text-[#1E40AF] font-bold">Mood of the Day</h2>

        <div className="border border-dashed border-[#D0E1FD] rounded-xl flex flex-col gap-1 items-center py-5">
          <img src={current.icon} alt={current.label} className="w-12 h-12" />
          {saved && <p className="text-xl text-[#3B82F6] font-semibold">{current.label}</p>}
          <p className="text-sm text-[#C7CAD1]">
            {saved
              ? `Updated today at ${formatTime(saved.updatedAt)}`
              : "No mood logged for the day"}
          </p>
        </div>

        <div className="flex gap-5 px-5 pb-3 justify-center md:gap-10">
          {MOODS.map((mood) => (
            <button
              key={mood.state}
              onClick={() => handleMoodSelection(mood)}
              disabled={saving}
              className="transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <img src={mood.icon} alt={mood.label} />
            </button>
          ))}
        </div>

        {status === "error" && <p className="text-xs text-red-400 text-center px-2">{errorMsg}</p>}
        {errorMsg && status !== "error" && <p className="text-xs text-red-400 text-center px-2">{errorMsg}</p>}
        {saving && <p className="text-xs text-[#93C5FD] text-center px-2 animate-pulse">Saving…</p>}
      </div>
    </div>
  );
}
