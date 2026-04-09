import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Upload, Trash2, X, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

type Photo = {
  id: number;
  image_url: string;
  caption: string;
  uploaded_at: string;
};

type PictureWidgetProps = {
  editable?: boolean;
  photos?: Photo[];
};

export default function PictureWidget({ editable = true, photos: externalPhotos }: PictureWidgetProps) {
  const [photos, setPhotos] = useState<Photo[]>(externalPhotos ?? []);
  const [current, setCurrent] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null); // file waiting for replace confirmation
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editable) {
      api.get<Photo[]>("/api/wellness/photos/").then(({ data }) => setPhotos(data));
    }
  }, [editable]);

  useEffect(() => {
    if (current >= photos.length && photos.length > 0) setCurrent(photos.length - 1);
  }, [photos]);

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent((i) => (i + 1) % photos.length);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (photos.length >= 4) {
      setPendingFile(file); // trigger confirmation modal
    } else {
      uploadFile(file, false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File, replace: boolean) => {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const endpoint = replace ? "/api/wellness/photos/replace/" : "/api/wellness/photos/";
      const { data } = await api.post<Photo>(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (replace) {
        // remove the oldest (first in array) and append the new one
        setPhotos((prev) => [...prev.slice(1), data]);
        setCurrent(photos.length - 1); // jump to new photo (last slot)
      } else {
        setPhotos((prev) => [...prev, data]);
        setCurrent(photos.length);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const confirmReplace = () => {
    if (pendingFile) uploadFile(pendingFile, true);
  };

  const cancelReplace = () => {
    setPendingFile(null);
    setError(null);
  };

  const handleDelete = async (photoId: number) => {
    try {
      await api.delete(`/api/wellness/photos/${photoId}/`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setError("Delete failed.");
    }
  };

  const currentPhoto = photos[current];
  const oldestPhoto = photos[0]; // for showing in confirmation

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Confirmation Modal */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 rounded-full p-2">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <h2 className="font-bold text-gray-800 text-base">Photo limit reached</h2>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              You've already uploaded <span className="font-semibold">4 photos</span> — the maximum allowed.
              To add this new photo, your earliest upload will be permanently removed.
            </p>

            {/* Preview of oldest photo being replaced */}
            {oldestPhoto && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
                <img
                  src={oldestPhoto.image_url}
                  alt="Oldest photo"
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Will be removed</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Uploaded {new Date(oldestPhoto.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button
                onClick={cancelReplace}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReplace}
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {uploading ? "Replacing..." : "Replace photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="bg-gray-200 p-4 pb-6 shadow-lg w-73 hover:rotate-1 transition-all ease-in-out relative">
        <div className="w-64 h-64 overflow-hidden bg-black relative">
          {currentPhoto ? (
            <>
              <img
                src={currentPhoto.image_url}
                alt={currentPhoto.caption || "Photo"}
                className="w-full h-full object-cover"
              />
              {editable && (
                <button
                  onClick={() => handleDelete(currentPhoto.id)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No photos yet
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 mt-3 text-sm min-h-[1.25rem]">
          {currentPhoto?.caption || ""}
        </p>

        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-0.5 shadow transition">
              <ChevronLeft size={18} className="text-gray-700" />
            </button>
            <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-0.5 shadow transition">
              <ChevronRight size={18} className="text-gray-700" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-1.5">
          {photos.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-blue-500" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}

      {/* Upload button — always visible when editable, even at 4 photos */}
      {editable && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Upload size={14} />
            {uploading ? "Uploading..." : `Add photo (${photos.length}/4)`}
          </button>
        </>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  );
}
