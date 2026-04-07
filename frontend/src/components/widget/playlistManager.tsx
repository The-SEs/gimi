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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Submit new file to Django
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newFile) return
    setIsAdding(true)

    try {
      // Look how clean this is now!
      const addedTrack = await musicService.addTrack(newTitle, newFile)

      setPlaylist([...playlist, addedTrack])
      setNewTitle("")
      setNewFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Upload error", error)
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
    } catch (error: any) {
      console.error("Django refused to delete it:", error)
      alert("Failed to delete song from database.")
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {playlist.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          {/* Note: passing audio_file instead of url */}
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
        <div className="w-80 h-64 border-2 border-dashed border-gray-300 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 bg-white/30 backdrop-blur-sm">
          <Music size={40} className="mb-2 opacity-50" />
          <p>Your playlist is empty.</p>
          <p className="text-sm">Upload an MP3 below to start!</p>
        </div>
      )}

      {/* The File Upload Form */}
      <form
        onSubmit={handleAddSong}
        className="w-80 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40 flex flex-col gap-3"
      >
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">
          Upload Track
        </h3>

        <input
          type="text"
          placeholder="Song Title (e.g., Lofi Study)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          required
        />

        {/* The File Input */}
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={(e) => setNewFile(e.target.files?.[0] || null)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 text-sm p-1"
          required
        />

        <button
          type="submit"
          disabled={isAdding}
          className="mt-2 flex items-center justify-center gap-2 bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 font-medium text-sm"
        >
          {isAdding ? (
            "Uploading..."
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
