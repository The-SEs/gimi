import { useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface JournalEntryResponse {
  id: number;
  title: string;
  content: string;
  created_at: string;
  // provided by backend journalentryserializer
  mood?: {
    mood_label?: string;
  };
}

export default function JournalEntry() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedEntry, setSavedEntry] = useState<JournalEntryResponse | null>(null);
  const [dailyMoodStatus, setDailyMoodStatus] = useState<"unknown" | "logged" | "already" | "error">("unknown");
  const navigate = useNavigate();

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  type ErrorShape = {
    response?: { data?: { detail?: unknown } };
    message?: unknown;
  };

  const getErrorMsg = (err: unknown, fallback: string): string => {
    const e = err as ErrorShape;
    const detail = e.response?.data?.detail;
    if (typeof detail === "string") return detail;
    const message = e.message;
    if (typeof message === "string") return message;
    return fallback;
  };

  type DailyMoodState = "HP" | "SD" | "AN" | "CM";
  const mapMoodLabelToDailyMoodState = (moodLabel?: string): DailyMoodState | null => {
    const label = (moodLabel ?? "").toLowerCase();
    switch (label) {
      case "happy":
        return "HP";
      case "sad":
        return "SD";
      case "anxious":
        return "AN";
      case "calm":
        return "CM";
      case "angry":
      case "stressed":
        return "AN";
      case "neutral":
        return "CM";
      case "excited":
        return "HP";
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setStatus("loading");
    setErrorMsg("");
    setDailyMoodStatus("unknown");

    try {
      const { data } = await api.post<JournalEntryResponse>("/api/wellness/journals/", {
        title: title.trim() || "Untitled Entry",
        content: content.trim(),
      });

      setSavedEntry(data);

      // Also log "daily mood" (manual log model) based on AI mood analysis from the journal entry.
      const dailyState = mapMoodLabelToDailyMoodState(data.mood?.mood_label);
      if (dailyState) {
        try {
          await api.post("/api/wellness/daily-moods/", { state: dailyState });
          setDailyMoodStatus("logged");
          window.dispatchEvent(new CustomEvent("daily-mood:updated"));
        } catch (err: unknown) {
          const msg = getErrorMsg(err, "Failed to log daily mood.");
          if (msg.toLowerCase().includes("already logged your mood for the day")) {
            setDailyMoodStatus("already");
            window.dispatchEvent(new CustomEvent("daily-mood:updated"));
          } else {
            setDailyMoodStatus("error");
          }
        }
      }

      setStatus("success");
      setTitle("");
      setContent("");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(getErrorMsg(err, "Something went wrong."));
    }
  };

  const handleNewEntry = () => {
    setStatus("idle");
    setSavedEntry(null);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ── Success state ──────────────────────────────────────────────
  if (status === "success" && savedEntry) {
    return (
      <div className="relative w-[90%] mx-auto mt-5 lg:w-[40%] xl:w-[30%]">
        {/* tape strip */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-blue-300/40 backdrop-blur-[1px] border-l border-r border-white/20 rotate-1 shadow-sm z-10" />

        <div className="bg-white py-8 px-7 rounded-3xl flex flex-col gap-5 shadow-sm">
          {/* checkmark */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#1E40AF] font-bold text-xl font-[var(--font-liberation,serif)]">Entry Saved!</p>
            <p className="text-[#C7CAD1] text-sm text-center">
              Your journal has been saved and is being analyzed.
            </p>
            {dailyMoodStatus === "logged" && (
              <p className="text-[#93C5FD] text-sm text-center">Your mood was logged for today.</p>
            )}
            {dailyMoodStatus === "already" && (
              <p className="text-[#93C5FD] text-sm text-center">Your mood for today was already logged.</p>
            )}
          </div>

          {/* saved entry preview */}
          <div className="border border-dashed border-[#D0E1FD] rounded-xl px-5 py-4 flex flex-col gap-1">
            <p className="text-[#1E40AF] font-semibold text-sm">{savedEntry.title}</p>
            <p className="text-[#9CA3AF] text-xs line-clamp-2">{savedEntry.content}</p>
            <p className="text-[#C7CAD1] text-xs mt-1">
              {new Date(savedEntry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <button
            onClick={handleNewEntry}
            className="w-full py-3 rounded-2xl bg-blue-100 text-[#1E40AF] font-semibold text-sm hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
          >
            Write Another Entry
          </button>
        </div>
      </div>
    );
  }

  // ── Main journal form ─────────────────────────────────────────
  return (
    <div className="relative w-[90%] mx-auto mt-5 lg:w-[40%] xl:w-[30%]">
      {/* tape strip */}
      <div className="absolute -top-3 left-1/4 -translate-x-1/4 w-20 h-6 bg-blue-300/40 backdrop-blur-[1px] border-l border-r border-white/20 rotate-1 shadow-sm z-10" />

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute -top-10 left-0 text-[#1E40AF] flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white py-5 px-7 rounded-3xl flex flex-col gap-4 shadow-sm">

        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-[#1E40AF] font-bold font-[var(--font-liberation,serif)]">
              Today's Journal
            </h2>
            <p className="text-[#C7CAD1] text-xs mt-0.5">{today}</p>
          </div>
          {/* quill icon */}
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4.5 1.5 1.5-4.5L16.862 3.487z" />
            </svg>
          </div>
        </div>

        {/* title input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#C7CAD1] font-medium uppercase tracking-wide">Title</label>
          <input
            type="text"
            placeholder="Give this entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D0E1FD] bg-blue-50/30 text-[#1E40AF] placeholder-[#C7CAD1] text-sm focus:outline-none focus:border-blue-300 focus:bg-white transition-colors duration-200"
          />
        </div>

        {/* content textarea */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#C7CAD1] font-medium uppercase tracking-wide">Entry</label>
          <div className="relative">
            <textarea
              placeholder="What's on your mind today? Write freely..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-[#D0E1FD] bg-blue-50/30 text-[#374151] placeholder-[#C7CAD1] text-sm focus:outline-none focus:border-blue-300 focus:bg-white transition-colors duration-200 resize-none leading-relaxed"
            />
            {/* subtle ruled lines feel */}
            <div className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden opacity-[0.03]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-b border-blue-400" style={{ marginTop: i === 0 ? "2.8rem" : 0, height: "1.6rem" }} />
              ))}
            </div>
          </div>

          {/* word / char count */}
          <div className="flex gap-3 justify-end">
            <span className="text-[10px] text-[#C7CAD1]">{wordCount} words</span>
            <span className="text-[10px] text-[#C7CAD1]">{charCount} chars</span>
          </div>
        </div>

        {/* AI note */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-[#D0E1FD]">
          <svg className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-[10px] text-[#93C5FD]">AI will analyze your mood after saving</p>
        </div>

        {/* error */}
        {status === "error" && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* submit button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || status === "loading"}
          className="w-full py-3.5 rounded-2xl bg-[#1E40AF] text-white font-semibold text-sm
            hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Entry"
          )}
        </button>

      </div>
    </div>
  );
}
