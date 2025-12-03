import apiClient from "./client";

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  clinicId: string;
  phone: string;
  experience: number;
}

export const doctorsAPI = {
  getAll: async () => {
    const response = await apiClient.get<Doctor[]>("/doctors");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },

  getByClinic: async (clinicId: string) => {
    const response = await apiClient.get<Doctor[]>(`/doctors/clinic/${clinicId}`);
    return response.data;
  },

  create: async (data: Partial<Doctor>) => {
    const response = await apiClient.post<Doctor>("/doctors", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Doctor>) => {
    const response = await apiClient.put<Doctor>(`/doctors/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/doctors/${id}`);
    return response.data;
  },
};