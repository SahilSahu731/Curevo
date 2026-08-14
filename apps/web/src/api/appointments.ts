import apiClient from "./client";

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  date: string;
  slotTime: string;
  status: "booked" | "waiting" | "in-progress" | "completed" | "cancelled" | "no-show";
  consultationType?: "in-person" | "video";
  telehealthUrl?: string;
}

export const appointmentsAPI = {
  getAll: async () => {
    const response = await apiClient.get<{ data: Appointment[] }>("/appointments");
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Appointment }>(`/appointments/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Appointment>) => {
    const response = await apiClient.post<{ data: Appointment }>("/appointments", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Appointment>) => {
    const response = await apiClient.put<{ data: Appointment }>(`/appointments/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/appointments/${id}`);
    return response.data;
  },
};
