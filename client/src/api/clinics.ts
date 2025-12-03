import apiClient from "./client";

export interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
}

export const clinicsAPI = {
  getAll: async () => {
    const response = await apiClient.get<Clinic[]>("/clinics");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Clinic>(`/clinics/${id}`);
    return response.data;
  },

  create: async (data: Partial<Clinic>) => {
    const response = await apiClient.post<Clinic>("/clinics", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Clinic>) => {
    const response = await apiClient.put<Clinic>(`/clinics/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/clinics/${id}`);
    return response.data;
  },
};