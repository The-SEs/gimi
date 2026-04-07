import { api } from "./api"

export interface Track {
  id: number
  title: string
  url: string
  added_at: string
}

export const musicService = {
  getTracks: async (): Promise<Track[]> => {
    const response = await api.get<Track[]>("/api/wellness/tracks/")
    return response.data
  },

  addTrack: async (title: string, url: string): Promise<Track> => {
    const response = await api.post<Track>("/api/wellness/tracks/", {
      title,
      url,
    })
    return response.data
  },

  deleteTrack: async (id: number): Promise<void> => {
    await api.delete(`/api/wellness/tracks/${id}/`)
  },
}
