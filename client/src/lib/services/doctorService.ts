import api from "../api";

export const doctorService = {
  getAllDoctors: async (params?: any) => {
    const response = await api.get("/doctors", { params });
    return response.data;
  },
  
  getDoctor: async (id: string) => {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
  },

  getAvailableSlots: async (doctorId: string, date: string) => {
      const response = await api.get(`/doctors/slots/${doctorId}`, { params: { date } });
      return response.data;
  },

  updateDoctor: async (id: string, data: any) => {
      const response = await api.put(`/doctors/${id}`, data);
      return response.data;
  },

  deleteDoctor: async (id: string) => {
      const response = await api.delete(`/doctors/${id}`);
      return response.data;
  },

  getReviews: async (doctorId: string) => {
      const response = await api.get(`/reviews/${doctorId}`);
      return response.data;
  },

  createReview: async (reviewData: any) => {
      const response = await api.post(`/reviews`, reviewData);
      return response.data;
  }
};
