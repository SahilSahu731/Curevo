import api from "../api";

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Appointments
  getAllAppointments: async (params?: { page?: number; limit?: number; status?: string; date?: string }) => {
      const response = await api.get("/admin/appointments", { params });
      return response.data;
  },

  getUserAppointments: async (userId: string) => {
      const response = await api.get(`/admin/users/${userId}/appointments`);
      return response.data;
  },

  getDoctorVerifications: async (status = "pending") => {
      const response = await api.get("/admin/doctor-verifications", { params: { status } });
      return response.data;
  },

  reviewDoctorVerification: async (doctorId: string, data: { status: "approved" | "rejected"; notes?: string }) => {
      const response = await api.patch(`/admin/doctor-verifications/${doctorId}`, data);
      return response.data;
  },

  getFeedback: async (params?: { status?: string; category?: string }) => {
      const response = await api.get("/admin/feedback", { params });
      return response.data;
  },

  updateFeedback: async (id: string, data: { status?: string; priority?: string; adminResponse?: string }) => {
      const response = await api.patch(`/admin/feedback/${id}`, data);
      return response.data;
  }
};
