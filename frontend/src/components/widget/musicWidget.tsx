import { SkipBack, SkipForward, Music } from "lucide-react"

type MusicPlayerProps = {
  title: string
  url: string
  onNext: () => void
  onPrev: () => void
}

export default function MusicPlayer({
  title,
  url,
  onNext,
  onPrev,
}: MusicPlayerProps) {
  // 1. Clean the URL and check types
  const cleanUrl = url ? url.trim() : ""
  const isSpotify = cleanUrl.includes("spotify.com")

  // 2. Helper to get Spotify Embed URL
  const getSpotifyEmbedUrl = (link: string) => {
    if (link.includes("/embed/")) return link
    // Converts standard links to embed links
    const idMatch = link.match(/track\/([^?]+)/)
    const id = idMatch ? idMatch[1] : ""
    return `https://open.spotify.com/embed/track/${id}`
  }

  // 3. Helper to get YouTube ID from any link format
  const getYouTubeId = (link: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = link.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const ytId = getYouTubeId(cleanUrl)

  return (
    <div className="relative w-80 bg-white/70 backdrop-blur-md rounded-[2rem] p-5 shadow-xl border border-white/20">
      {/* Tape Sticker */}
      <div className="absolute -top-4 right-6 w-32 h-10 bg-white/60 rotate-12 rounded-md backdrop-blur-sm shadow-sm z-10" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Music className="text-blue-600" size={20} />
        <h2 className="text-gray-800 font-semibold text-lg truncate">
          {title}
        </h2>
      </div>

      <div className="bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center h-48 relative">
        {isSpotify ? (
          /* --- NATIVE SPOTIFY IFRAME --- */
          <iframe
            src={getSpotifyEmbedUrl(cleanUrl)}
            width="100%"
            height="152"
            className="rounded-xl border-0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : ytId ? (
          /* --- NATIVE YOUTUBE IFRAME --- */
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
            title="YouTube video player"
            className="border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          /* --- FALLBACK --- */
          <div className="text-gray-500 text-xs p-4 text-center">
            Unsupported link format.
            <br />
            Please use a standard YouTube or Spotify URL.
          </div>
        )}
      </div>

      {/* NOTE ON THE PROGRESS BAR:
          Since we are not using a library, we cannot "read" the time from inside the YouTube iframe.
          The user will use the progress bar ALREADY BUILT INTO the YouTube player above.
      */}

      {/* Custom Playlist Controls */}
      <div className="flex justify-center items-center gap-12 mt-6">
        <button
          onClick={onPrev}
          className="p-2 text-gray-700 hover:text-blue-600 transition-colors bg-white/50 rounded-full shadow-sm hover:scale-105"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={onNext}
          className="p-2 text-gray-700 hover:text-blue-600 transition-colors bg-white/50 rounded-full shadow-sm hover:scale-105"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  )
}
