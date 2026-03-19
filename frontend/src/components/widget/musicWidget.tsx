import { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";

type MusicPlayerProps = {
  title: string;
  src: string;
  cover: string;
};

export default function MusicPlayer({
  title,
  src,
  cover,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  return (
    <div className="">
      
      {/* CARD */}
      <div className="relative w-80 bg-white/70 backdrop-blur-md rounded-[2rem] p-5 shadow-xl">
        
        {/* Tape Sticker */}
        <div className="absolute -top-4 right-6 w-32 h-10 bg-white/40 rotate-12 rounded-md backdrop-blur-sm" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Music className="text-black" size={20} />
          <h2 className="text-blue-700 font-semibold text-lg">{title}</h2>
        </div>

        {/* Image Frame */}
        <div className="bg-white/40 p-3 rounded-2xl">
          <img
            src={cover}
            alt={title}
            className="w-full h-56 object-cover rounded-xl"
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-black/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-8 mt-5">
          <button>
            <SkipBack size={22} />
          </button>

          <button
            onClick={togglePlay}
            className="bg-black text-white p-3 rounded-full"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button>
            <SkipForward size={22} />
          </button>
        </div>

        {/* Audio */}
        <audio ref={audioRef} src={src} />
      </div>
    </div>
  );
}