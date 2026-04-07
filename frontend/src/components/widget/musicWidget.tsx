import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react"

type MusicPlayerProps = {
  title: string
  audioUrl: string // Coming from Django's audio_file field
  onNext: () => void
  onPrev: () => void
}

export default function MusicPlayer({
  title,
  audioUrl,
  onNext,
  onPrev,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // The hidden HTML5 Audio Engine
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Ensure the URL is absolute so React can find it on your Django server
    const fullUrl = audioUrl?.startsWith("http")
      ? audioUrl
      : `http://127.0.0.1:8000${audioUrl}`

    audioRef.current = new Audio(fullUrl)
    setIsPlaying(false)
    setProgress(0)

    // Sync audio time with the blue progress bar
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100,
        )
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onNext()
    }

    audioRef.current.addEventListener("timeupdate", updateProgress)
    audioRef.current.addEventListener("ended", handleEnded)

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress)
        audioRef.current.removeEventListener("ended", handleEnded)
        audioRef.current.pause()
      }
    }
  }, [audioUrl, onNext])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPercentage = Number(e.target.value)

    if (audioRef.current && audioRef.current.duration) {
      // Convert percentage back into seconds
      const newTime = (seekPercentage / 100) * audioRef.current.duration
      audioRef.current.currentTime = newTime

      // Update the visual bar instantly
      setProgress(seekPercentage)
    }
  }

  return (
    <div className="relative w-80 bg-white/70 backdrop-blur-md rounded-[2rem] p-5 shadow-xl border border-white/20">
      {/* Tape Sticker */}
      <div className="absolute -top-4 right-6 w-32 h-10 bg-white/60 rotate-12 rounded-md backdrop-blur-sm shadow-sm z-10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Music className="text-blue-600" size={20} />
        <h2 className="text-gray-800 font-semibold text-lg truncate">
          {title}
        </h2>
      </div>

      {/* Visualizer (Spins when playing) */}
      <div className="relative w-full h-48 bg-gray-900 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
        <div
          className={`w-28 h-28 bg-white/10 rounded-full border-4 border-gray-700 flex items-center justify-center ${isPlaying ? "animate-[spin_3s_linear_infinite]" : ""}`}
        >
          <div className="w-8 h-8 bg-gray-900 rounded-full"></div>
        </div>
      </div>

      {/* INTERACTIVE PROGRESS BAR */}
      <div className="mt-8 relative w-full h-3 flex items-center group">
        {/* 1. The Visual Bar  */}
        <div className="absolute top-1 left-0 w-full h-1.5 bg-black/10 rounded-full overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-75 ease-linear group-hover:bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 2. The Invisible Interactive Slider  */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1" // Smooth dragging
          value={progress || 0}
          onChange={handleSeek}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
      {/* Custom Controls */}
      <div className="flex justify-center items-center gap-8 mt-6 relative z-10">
        <button
          onClick={onPrev}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <SkipBack size={24} />
        </button>

        <button
          onClick={togglePlay}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        <button
          onClick={onNext}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <SkipForward size={24} />
        </button>
      </div>
    </div>
  )
}
