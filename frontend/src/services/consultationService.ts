import { api } from "./api";

export interface Consultation {
  id?: number;
  requested_date: string;
  reason: string;
  status?: "PE" | "SC" | "CO" | "CA";
  mode_of_consultation: "ON" | "FF";
}

export const consultationService = {
  getConsultations: async (): Promise<Consultation[]> => {
    const response = await api.get<Consultation[]>("/api/consultations/");
    return response.data;
  },

  createConsultations: async (data: Consultation): Promise<Consultation> => {
    const response = await api.post<Consultation>("/api/consultations/", data);
    return response.data;
  },
};
