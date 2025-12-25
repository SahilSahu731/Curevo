import api from "../api";

export const clinicService = {
  getAllClinics: async () => {
    const response = await api.get("/clinics");
    return response.data;
  },
  
  getClinic: async (id: string) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  },

  createClinic: async (data: any) => {
    const response = await api.post("/clinics", data);
    return response.data;
  },

  updateClinic: async (id: string, data: any) => {
    const response = await api.put(`/clinics/${id}`, data);
    return response.data;
  },

  deleteClinic: async (id: string) => {
    const response = await api.delete(`/clinics/${id}`);
    return response.data;
  }
};
