import { useState, useEffect, useRef } from "react"
import MusicPlayer from "./musicWidget"
import { musicService, type Track } from "../../services/musicService"
import { Plus, Trash2, Music } from "lucide-react"

export default function PlaylistManager() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Form State
  const [newTitle, setNewTitle] = useState("")
  const [newFile, setNewFile] = useState<File | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [errorMsg, setErrorMsg] = useState("") // NEW: Error state
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- THE GUARDRAILS ---
  const MAX_SONGS = 3
  const MAX_FILE_SIZE_MB = 10
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  // Fetch from Django on load
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const data = await musicService.getTracks()
        setPlaylist(data)
      } catch (error) {
        console.error("Failed to load music dashboard", error)
      }
    }
    fetchMusic()
  }, [])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1))
  }

  // --- NEW: File Validation Logic ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("") // Clear old errors
    const file = e.target.files?.[0]

    if (!file) {
      setNewFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(
        `"${file.name}" is too large! Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
      )
      e.target.value = "" // Clear the input
      setNewFile(null)
      return
    }

    if (!file.type.startsWith("audio/")) {
      setErrorMsg("Please upload a valid audio file (e.g., MP3, WAV).")
      e.target.value = "" // Clear the input
      setNewFile(null)
      return
    }

    setNewFile(file)
  }

  // Submit new file to Django
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final check before sending to server
    if (playlist.length >= MAX_SONGS) {
      setErrorMsg(
        `You can only have a maximum of ${MAX_SONGS} songs in your playlist.`,
      )
      return
    }

    if (!newTitle || !newFile) return

    setIsAdding(true)
    setErrorMsg("")

    try {
      const addedTrack = await musicService.addTrack(newTitle, newFile)

      setPlaylist([...playlist, addedTrack])
      setNewTitle("")
      setNewFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Upload error", error)
      setErrorMsg("Failed to upload song. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteSong = async () => {
    if (playlist.length === 0) return
    const songId = playlist[currentIndex].id

    try {
      await musicService.deleteTrack(songId)
      const newPlaylist = playlist.filter((track) => track.id !== songId)
      setPlaylist(newPlaylist)
      setCurrentIndex(0)
      setErrorMsg("") // Clear errors in case they deleted to make room
    } catch (error: any) {
      console.error("Django refused to delete it:", error)
      alert("Failed to delete song from database.")
    }
  }

  const isPlaylistFull = playlist.length >= MAX_SONGS

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto ">
      {playlist.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <MusicPlayer
            title={playlist[currentIndex].title}
            audioUrl={playlist[currentIndex].audio_file}
            onNext={handleNext}
            onPrev={handlePrev}
          />
          <button
            onClick={handleDeleteSong}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors mt-2"
          >
            <Trash2 size={14} /> Remove from Playlist
          </button>
        </div>
      ) : (
        <div className="w-80 h-64 border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 bg-[#f0f7ff] backdrop-blur-sm">
          <Music size={40} className="mb-2 opacity-50" />
          <p>Your playlist is empty.</p>
          <p className="text-sm">Upload an MP3 below to start!</p>
        </div>
      )}

      {/* The File Upload Form */}
      <form
        onSubmit={handleAddSong}
        className={`w-80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40 flex flex-col gap-3 transition-all ${
          isPlaylistFull ? "bg-gray-100 opacity-80" : "bg-[#f0f7ff]"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
            {isPlaylistFull ? "Playlist Full" : "Upload Track"}
          </h3>
          <span className="text-xs font-medium text-gray-500">
            {playlist.length}/{MAX_SONGS}
          </span>
        </div>

        {/* Display Error Messages */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-2 rounded-md border border-red-100">
            {errorMsg}
          </div>
        )}

        <input
          type="text"
          placeholder="Song Title (e.g., Lofi Study)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPlaylistFull || isAdding}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:cursor-not-allowed disabled:bg-gray-200"
          required
        />

        {/* The File Input */}
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileSelect} // Updated to use the validation function
          disabled={isPlaylistFull || isAdding}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 text-sm p-1 disabled:cursor-not-allowed"
          required
        />

        <button
          type="submit"
          disabled={isAdding || isPlaylistFull || !newFile}
          className="mt-2 flex items-center justify-center gap-2 bg-blue-800 text-white p-2.5 rounded-lg hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
        >
          {isAdding ? (
            "Uploading..."
          ) : isPlaylistFull ? (
            "Maximum 3 Songs Reached"
          ) : (
            <>
              <Plus size={16} /> Upload to Server
            </>
          )}
        </button>
      </form>
    </div>
  )
}
