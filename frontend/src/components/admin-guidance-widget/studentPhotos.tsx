import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react"
import { useState } from "react"

type Photo = {
  id: number
  image_url: string
  caption: string
  uploaded_at: string
}

type Props = {
  photos: Photo[]
}

export default function StudentPhotosWidget({ photos }: Props) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setCurrent((i) => (i + 1) % photos.length)

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Student Photos
      </p>

      {photos.length === 0 ? (
        <div className="aspect-square w-full bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2">
          <ImageOff size={24} className="text-gray-300" />
          <span className="text-xs text-gray-400">No photos uploaded</span>
        </div>
      ) : (
        <>
          {/* Image frame */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100">
            <img
              src={photos[current].image_url}
              alt={photos[current].caption || "Student photo"}
              className="w-full h-full object-cover"
            />

            {/* Arrows — only if multiple photos */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
                >
                  <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>

                {/* Counter pill */}
                <div className="absolute bottom-2 right-2 bg-black/40 rounded-full px-2 py-0.5">
                  <span className="text-white text-[11px] font-medium">
                    {current + 1} / {photos.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === current ? "bg-gray-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Upload date — matches the key/value rows in StudentIdentityWidget */}
          <div className="border-t border-gray-50 pt-3 flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase text-[10px]">
              Uploaded
            </span>
            <span className="text-gray-700 font-medium text-xs">
              {fmt(photos[current].uploaded_at)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
