import { api } from './api';

interface DrawingData {
  id?: number;
  title: string;
  canvas_data?: unknown;
}

interface Drawing extends DrawingData {
  id: number;
  created_at: string;
  updated_at: string;
}

export const canvasService = {
  saveDrawing: async (title: string, canvasData: unknown, drawingId?: number): Promise<Drawing> => {
    if (drawingId) {
      // Update existing drawing
      const { data } = await api.put<Drawing>(`/api/wellness/drawings/${drawingId}/`, {
        title,
        canvas_data: canvasData,
      });
      return data;
    } else {
      // Create new drawing
      const { data } = await api.post<Drawing>('/api/wellness/drawings/', {
        title,
        canvas_data: canvasData,
      });
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
