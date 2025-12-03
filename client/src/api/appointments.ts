import apiClient from "./client";

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export const appointmentsAPI = {
  getAll: async () => {
    const response = await apiClient.get<Appointment[]>("/appointments");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  create: async (data: Partial<Appointment>) => {
    const response = await apiClient.post<Appointment>("/appointments", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Appointment>) => {
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
};