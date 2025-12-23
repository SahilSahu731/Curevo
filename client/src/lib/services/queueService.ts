import api from "../api";

export const queueService = {
  getDoctorQueue: async (doctorId: string) => {
    // Or just GET /queue/doctor/:id
    const response = await api.get(`/queue/doctor/${doctorId}`);
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
