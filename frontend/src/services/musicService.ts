import { api } from "./api"

export interface Track {
  id: number
  title: string
  audio_file: string // Changed from 'url'
  created_at: string // Changed from 'added_at' to match Django
}

export const musicService = {
  getTracks: async (): Promise<Track[]> => {
    const response = await api.get<Track[]>("/api/wellness/tracks/")
    return response.data
  },

  // Upgraded to handle File uploads!
  addTrack: async (title: string, file: File): Promise<Track> => {
    const formData = new FormData()
    formData.append("title", title)
    formData.append("audio_file", file)

    // Pass the specific multipart header as the third argument to override your api.ts defaults
    const response = await api.post<Track>("/api/wellness/tracks/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  deleteTrack: async (id: number): Promise<void> => {
    await api.delete(`/api/wellness/tracks/${id}/`)
  },
}
