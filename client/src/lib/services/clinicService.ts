import api from "../api";

export const clinicService = {
  getAllClinics: async () => {
    const response = await api.get("/clinics");
    return response.data;
  },
  
  getClinic: async (id: string) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  }
};
