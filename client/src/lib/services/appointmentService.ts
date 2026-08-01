import api from "../api";

export const appointmentService = {
  getMyAppointments: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/patients/appointments", { params });
    return response.data;
  },

  bookAppointment: async (data: any) => {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  getAppointment: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await api.post("/queue/join", { appointmentId: id });
    return response.data;
  },

  cancelAppointment: async (id: string) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
  
  getQueuePosition: async (appointmentId: string) => {
    const response = await api.get(`/queue/position/${appointmentId}`);
    return response.data;
  },

  getTelehealthSession: async (appointmentId: string) => {
    const response = await api.get(`/appointments/${appointmentId}/telehealth`);
    return response.data;
  }
};
