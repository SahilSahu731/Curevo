import api from "../api";

export const appointmentService = {
  getMyAppointments: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/patients/appointments", { params });
    return response.data;
  },

  bookAppointment: async (data: any) => {
    const response = await api.post("/patients/appointment", data);
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await api.post(`/patients/appointment/${id}/check-in`);
    return response.data;
  },

  cancelAppointment: async (id: string) => {
    const response = await api.delete(`/patients/appointment/${id}`);
    return response.data;
  },
  
  getQueuePosition: async (appointmentId: string) => {
    const response = await api.get(`/queue/position/${appointmentId}`);
    return response.data;
  }
};
