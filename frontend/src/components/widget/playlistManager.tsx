import { useState, useEffect } from "react"
import MusicPlayer from "./musicWidget"
import { musicService, type Track } from "../../services/musicService"
import { Plus, Trash2, Music } from "lucide-react"

export default function PlaylistManager() {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Form State
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

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

  // Playlist Navigation Logic
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1))
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1))
  }

  // Submit new song to Django
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newUrl) return
    setIsAdding(true)

    try {
      const addedTrack = await musicService.addTrack(newTitle, newUrl)
      setPlaylist([...playlist, addedTrack])
      setNewTitle("")
      setNewUrl("")
    } catch (error) {
      console.error("Failed to add track", error)
    } finally {
      setIsAdding(false)
    }
  }

  // Delete song from Django
  const handleDeleteSong = async () => {
    if (playlist.length === 0) return
    const songId = playlist[currentIndex].id

    try {
      // 1. Await the database deletion first
      await musicService.deleteTrack(songId)

      // 2. ONLY if step 1 succeeds, remove it from the screen
      const newPlaylist = playlist.filter((track) => track.id !== songId)
      setPlaylist(newPlaylist)
      setCurrentIndex(0)
      console.log("Successfully deleted from Database AND Screen!")
    } catch (error: any) {
      // 3. If Django fails, DO NOT hide it from the screen!
      console.error("Django refused to delete it:", error)
      alert("Failed to delete song from database. Check console.")
    }
  }

  // Helper function to keep our code clean
  const removeSongFromUI = (id: number) => {
    const newPlaylist = playlist.filter((track) => track.id !== id)
    setPlaylist(newPlaylist)
    setCurrentIndex(0)
  }
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* 1. Render the Music Player (or a placeholder if empty) */}
      {playlist.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <MusicPlayer
            title={playlist[currentIndex].title}
            url={playlist[currentIndex].url}
            onNext={handleNext}
            onPrev={handlePrev}
          />
          {/* Delete Button */}
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
          <p className="text-sm">Add a link below to start!</p>
        </div>
      )}

      {/* 2. The Add Song Form */}
      <form
        onSubmit={handleAddSong}
        className="w-80 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/40 flex flex-col gap-3"
      >
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider mb-1">
          Add to Playlist
        </h3>

        <input
          type="text"
          placeholder="Song Title (e.g., Lofi Study)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          required
        />

        <input
          type="url"
          placeholder="YouTube or Spotify Link"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          required
        />

        <button
          type="submit"
          disabled={isAdding}
          className="mt-2 flex items-center justify-center gap-2 bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 font-medium text-sm"
        >
          {isAdding ? (
            "Adding..."
          ) : (
            <>
              <Plus size={16} /> Add Link
            </>
          )}
        </button>
      </form>
    </div>
  )
}
