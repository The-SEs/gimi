import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { useNavigate } from "react-router-dom"
import GimiAlert from "../alert/gimiAlert"
import Consulation from "../header/consultation"

interface JournalEntryResponse {
  id: number
  title: string
  content: string
  created_at: string
  mood?: {
    mood_label?: string
  }
}

type ErrorShape = {
  response?: { data?: { detail?: unknown } }
  message?: unknown
}

const getErrorMsg = (err: unknown, fallback: string): string => {
  const e = err as ErrorShape
  const detail = e.response?.data?.detail
  if (typeof detail === "string") return detail
  if (typeof e.message === "string") return e.message
  return fallback
}

export default function DailyEntryEditor() {
  const navigate = useNavigate()

  const [entries, setEntries] = useState<JournalEntryResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [savedEntry, setSavedEntry] = useState<JournalEntryResponse | null>(
    null,
  )
  const [isViewMode, setIsViewMode] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const isToday = (dateStr: String) =>
    new Date(String(dateStr)).toDateString() === new Date().toDateString()

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data } = await api.get<JournalEntryResponse[]>(
        "/api/wellness/journals/",
      )
      //sort entries by created_at in descending order
      const sortedEntries = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setEntries(sortedEntries)

      //check if there is entry today
      const today = new Date().toDateString()
      const todayEntry = sortedEntries.find(
        (entry) => new Date(entry.created_at).toDateString() === today,
      )

      if (todayEntry) {
        //if there is entry today show it in view mode
        setCurrentIndex(sortedEntries.findIndex((e) => e.id === todayEntry.id))
        setTitle(todayEntry.title)
        setBody(todayEntry.content)
        setIsViewMode(false)
        setEditingEntryId(todayEntry.id)
      } else {
        //if no entry today show empty form for new entry
        setCurrentIndex(-1)
        setTitle("")
        setBody("")
        setIsViewMode(false)
      }
    } catch (err) {
      console.error("Failed to fetch entries:", err)
    }
  }

  const handleSubmit = async () => {
    if (!body.trim()) return
    setStatus("loading")
    setErrorMsg("")

    try {
      let data: JournalEntryResponse

      if (editingEntryId !== null) {
        //update existing entry
        ;({ data } = await api.patch<JournalEntryResponse>(
          `/api/wellness/journals/${editingEntryId}/`,
          { title: title.trim() || "Untitled Entry", content: body.trim() },
        ))
        setEntries((prev) =>
          prev.map((e) => (e.id === editingEntryId ? data : e)),
        )
      } else {
        //create new entry
        ;({ data } = await api.post<JournalEntryResponse>(
          "/api/wellness/journals/",
          {
            title: title.trim() || "Untitled Entry",
            content: body.trim(),
          },
        ))
        setEntries((prev) => [data, ...prev])
        setEditingEntryId(data.id)
      }

      setSavedEntry(data)
      setCurrentIndex(0)
      setIsViewMode(true)

      const response = data as any

      if (response.status === "high_risk") {
        setStatus("idle")
        setAlertMessage(response.message)
        setShowAlert(true)
      } else {
        setStatus("success")
        setTimeout(() => navigate("/dashboard"), 2000)
      }
    } catch (err: unknown) {
      setStatus("error")
      setErrorMsg(getErrorMsg(err, "Something went wrong. Please try again."))
    }
  }
  const handleNewEntry = () => {
    setStatus("idle")
    setSavedEntry(null)
    setTitle("")
    setBody("")
    setErrorMsg("")
    setIsViewMode(false)
    setCurrentIndex(-1)
    setEditingEntryId(null)
  }

  const handlePreviousEntry = () => {
    if (currentIndex < entries.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      const entry = entries[nextIndex]
      setTitle(entry.title)
      setBody(entry.content)
      setIsViewMode(!isToday(entry.created_at))
      setEditingEntryId(isToday(entry.created_at) ? entry.id : null)
    }
  }

  const handleNextEntry = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      const entry = entries[prevIndex]
      setTitle(entry.title)
      setBody(entry.content)
      setIsViewMode(!isToday(entry.created_at))
      setEditingEntryId(isToday(entry.created_at) ? entry.id : null)
    }
  }

  const handleEditNew = () => {
    setTitle("")
    setBody("")
    setIsViewMode(false)
    setCurrentIndex(-1)
  }

  //get current date for display
  const getDisplayDate = () => {
    if (currentIndex >= 0 && entries[currentIndex]) {
      return new Date(entries[currentIndex].created_at).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )
    }
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  //check if today's entry exists
  const hasTodayEntry = entries.some(
    (entry) =>
      new Date(entry.created_at).toDateString() === new Date().toDateString(),
  )

  //success
  if (status === "success" && savedEntry) {
    return (
      <div className="flex justify-center items-start w-full p-8">
        <div className="w-full max-w-[2000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden">
          <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />
          <div className="p-12 pt-8 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-700">
                Entry Saved!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Your journal entry has been saved.
              </p>
            </div>
            <div className="border border-dashed border-pink-200 rounded-xl px-6 py-4 w-full max-w-md flex flex-col gap-1">
              <p className="text-gray-700 font-semibold text-sm">
                {savedEntry.title}
              </p>
              <p className="text-gray-400 text-xs line-clamp-2">
                {savedEntry.content}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {new Date(savedEntry.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
    )
  }

  //main editor
  return (
    <div className="flex justify-center items-start w-full p-8">
      <div className="w-full max-w-[2000px] min-h-[1000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative flex flex-col">
        <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />

        {showAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <GimiAlert
                title="GIMI Notice"
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                actionNode={<Consulation />}
              />
            </div>
          </div>
        )}

        <div className="absolute top-6 right-8 flex gap-4 items-center text-xl">
          <button
            onClick={handlePreviousEntry}
            disabled={currentIndex >= entries.length - 1}
            className="text-pink-400 hover:text-pink-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous entry"
          >
            ‹
          </button>
          <button
            onClick={handleNextEntry}
            disabled={currentIndex <= 0}
            className="text-pink-400 hover:text-pink-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next entry"
          >
            ›
          </button>

          {!isViewMode ? (
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || status === "loading"}
              className="ml-4 px-5 py-2 bg-blue-800 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-900 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin inline-block mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          ) : (
            !hasTodayEntry && (
              <button
                onClick={handleEditNew}
                className="ml-4 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-green-700 active:scale-95 transition-all duration-150"
              >
                New Entry
              </button>
            )
          )}
        </div>

        <div className="p-12 pt-6 flex flex-col flex-1">
          {/*date*/}
          <div className="mb-4">
            <p className="text-gray-500 text-sm">{getDisplayDate()}</p>
          </div>

          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => !isViewMode && setTitle(e.target.value)}
            disabled={isViewMode}
            maxLength={255}
            className={`text-5xl font-semibold mb-8 w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-400 ${
              isViewMode ? "bg-transparent cursor-default" : ""
            }`}
          />

          <textarea
            placeholder="Enter text"
            value={body}
            onChange={(e) => !isViewMode && setBody(e.target.value)}
            disabled={isViewMode}
            className={`text-gray-700 leading-relaxed w-full flex-1 outline-none resize-none placeholder-gray-400 ${
              isViewMode ? "bg-transparent cursor-default" : ""
            }`}
          />

          {/*footer with word count*/}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-300 text-xs">
              <svg
                className="w-3.5 h-3.5 text-pink-300 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              {isViewMode
                ? "Viewing past entry"
                : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
            </div>

            {status === "error" && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
