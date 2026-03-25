import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface JournalEntryResponse {
  id: number;
  title: string;
  content: string;
  created_at: string;
  mood?: {
    mood_label?: string;
  };
}

type DailyMoodState = "HP" | "SD" | "AN" | "CM";

const mapMoodLabelToDailyMoodState = (moodLabel?: string): DailyMoodState | null => {
  switch ((moodLabel ?? "").toLowerCase()) {
    case "happy":
    case "excited":
      return "HP";
    case "sad":
      return "SD";
    case "anxious":
    case "angry":
    case "stressed":
      return "AN";
    case "calm":
    case "neutral":
      return "CM";
    default:
      return null;
  }
};

type ErrorShape = {
  response?: { data?: { detail?: unknown } };
  message?: unknown;
};

const getErrorMsg = (err: unknown, fallback: string): string => {
  const e = err as ErrorShape;
  const detail = e.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof e.message === "string") return e.message;
  return fallback;
};

export default function DailyEntryEditor() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedEntry, setSavedEntry] = useState<JournalEntryResponse | null>(null);
  const [dailyMoodStatus, setDailyMoodStatus] = useState<"unknown" | "logged" | "already" | "error">("unknown");

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!body.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    setDailyMoodStatus("unknown");

    try {
      const { data } = await api.post<JournalEntryResponse>("/api/wellness/journals/", {
        title: title.trim() || "Untitled Entry",
        content: body.trim(),
      });

      setSavedEntry(data);

      // Log daily mood derived from AI analysis
      const dailyState = mapMoodLabelToDailyMoodState(data.mood?.mood_label);
      if (dailyState) {
        try {
          await api.post("/api/wellness/daily-moods/", { state: dailyState });
          setDailyMoodStatus("logged");
          window.dispatchEvent(new CustomEvent("daily-mood:updated"));
        } catch (err: unknown) {
          const msg = getErrorMsg(err, "");
          if (msg.toLowerCase().includes("already logged your mood for the day")) {
            setDailyMoodStatus("already");
            window.dispatchEvent(new CustomEvent("daily-mood:updated"));
          } else {
            setDailyMoodStatus("error");
          }
        }
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(getErrorMsg(err, "Something went wrong. Please try again."));
    }
  };

  const handleNewEntry = () => {
    setStatus("idle");
    setSavedEntry(null);
    setTitle("");
    setBody("");
    setDate(new Date());
    setDailyMoodStatus("unknown");
    setErrorMsg("");
  };

  // ── Success state ─────────────────────────────────────────────
  if (status === "success" && savedEntry) {
    return (
      <div className="flex justify-center items-start w-full p-8">
        <div className="w-full max-w-[2000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />
          <div className="p-12 pt-8 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-700">Entry Saved!</p>
              <p className="text-gray-400 text-sm mt-1">Your journal is being analyzed.</p>
              {dailyMoodStatus === "logged" && (
                <p className="text-pink-400 text-sm mt-1">Your mood was logged for today.</p>
              )}
              {dailyMoodStatus === "already" && (
                <p className="text-pink-400 text-sm mt-1">Your mood for today was already logged.</p>
              )}
            </div>
            <div className="border border-dashed border-pink-200 rounded-xl px-6 py-4 w-full max-w-md flex flex-col gap-1">
              <p className="text-gray-700 font-semibold text-sm">{savedEntry.title}</p>
              <p className="text-gray-400 text-xs line-clamp-2">{savedEntry.content}</p>
              <p className="text-gray-300 text-xs mt-1">
                {new Date(savedEntry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={handleNewEntry}
              className="px-8 py-3 rounded-full bg-[#FFC4DB] text-pink-700 font-semibold text-sm hover:bg-pink-300 transition-colors duration-200 cursor-pointer"
            >
              Write Another Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main editor ───────────────────────────────────────────────
  return (
    <div className="flex justify-center items-start w-full p-8">
      <div className="w-full max-w-[2000px] min-h-[1000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative">
        <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />

        {/* Nav controls */}
        <div className="absolute top-6 right-8 flex gap-4 text-pink-400 text-xl">
          <button className="hover:text-pink-600 cursor-pointer" aria-label="Previous entry">‹</button>
          <button className="hover:text-pink-600 cursor-pointer" aria-label="Next entry">›</button>
          <button
            onClick={() => navigate("/dashboard")}
            className="ml-4 text-red-400 hover:text-red-600 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-12 pt-6 flex flex-col h-full">
          {/* Date picker */}
          <div className="mb-4">
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => d && setDate(d)}
              className="text-gray-500 text-sm outline-none border-b border-transparent focus:border-gray-300 w-full cursor-pointer"
              popperPlacement="bottom-start"
              dateFormat="MMMM d, yyyy"
            />
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="text-5xl font-semibold mb-8 w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-300"
          />

          {/* Body */}
          <textarea
            placeholder="Write freely — what's on your mind today?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="text-gray-700 leading-relaxed w-full flex-1 min-h-[450px] outline-none resize-none placeholder-gray-300"
          />

          {/* Footer row */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <svg className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI will analyze your mood after saving · {wordCount} {wordCount === 1 ? "word" : "words"}
            </div>

            <div className="flex items-center gap-3">
              {status === "error" && (
                <p className="text-xs text-red-400">{errorMsg}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!body.trim() || status === "loading"}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFC4DB] text-pink-700 font-semibold text-sm
                  hover:bg-pink-300 active:scale-[0.98] transition-all duration-200 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save Entry"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
