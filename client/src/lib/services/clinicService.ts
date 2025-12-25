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

  getClinicDoctors: async (id: string) => {
    const response = await api.get(`/clinics/${id}/doctors`);
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
  },

  getReviews: async (clinicId: string) => {
      const response = await api.get(`/clinic-reviews/${clinicId}`);
      return response.data.data;
  },

  createReview: async (reviewData: any) => {
      const response = await api.post("/clinic-reviews", reviewData);
      return response.data;
  }
};
