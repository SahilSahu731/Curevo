import api from "../api";

export const queueService = {
  getDoctorQueue: async (doctorId: string) => {
    const response = await api.get(`/queue/doctor/${doctorId}`);
    return response.data;
  },

  joinQueue: async (appointmentId: string) => {
    const response = await api.post("/queue/join", { appointmentId });
    return response.data;
  },

  updateStatus: async (appointmentId: string, status: string, notes?: string) => {
    const response = await api.patch("/queue/update", { appointmentId, status, notes });
    return response.data;
  },

  callNext: async () => {
    const response = await api.post("/doctors/call-next");
    return response.data;
  },

  completeConsultation: async (appointmentId: string, notes: string) => {
    const response = await api.put(`/doctors/complete-consultation/${appointmentId}`, { notes });
    return response.data;
  }
};
