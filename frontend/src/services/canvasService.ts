import { api } from './api';


interface DrawingData {
  id?: number;
  title: string;
  canvas_data?: unknown;
  image_b64?: String;
}

interface Drawing extends DrawingData {
  id: number;
  created_at: string;
  updated_at: string;
}

export const canvasService = {
   saveDrawing: async (
    title: string,
    canvasData: unknown,
    imageB64: string,       
    drawingId?: number
  ): Promise<Drawing> => {
    const payload = {
      title,
      canvas_data: canvasData,
      image_b64: imageB64,   
    };

    if (drawingId) {
      const { data } = await api.put<Drawing>(`/api/wellness/drawings/${drawingId}/`, payload);
      return data;
    } else {
      const { data } = await api.post<Drawing>('/api/wellness/drawings/', payload);
      return data;
    }
  },

  // Get all drawings for the user
  getAllDrawings: async (): Promise<Drawing[]> => {
    const { data } = await api.get<Drawing[]>('/api/wellness/drawings/');
    return data;
  },

  // Get a specific drawing by ID 
  getDrawing: async (id: number): Promise<Drawing> => {
    const { data } = await api.get<Drawing>(`/api/wellness/drawings/${id}/`);
    return data;
  },

  // Delete a drawing
  deleteDrawing: async (id: number): Promise<void> => {
    await api.delete(`/api/wellness/drawings/${id}/`);
  },
};
