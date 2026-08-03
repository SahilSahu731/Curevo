import api from "../api";

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getAllUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  updateUser: async (id: string, userData: { name?: string; phone?: string; role?: string; status?: string; targetEmail: string; reason: string }) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string, data: { targetEmail: string; reason: string }) => {
    const response = await api.delete(`/admin/users/${id}`, { data });
    return response.data;
  },

  // Appointments
  getAllAppointments: async (params?: { page?: number; limit?: number; status?: string; date?: string; search?: string; sortBy?: string; sortOrder?: string }) => {
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

  reviewDoctorVerification: async (doctorId: string, data: { status: "approved" | "rejected"; reason: string; notes?: string; expiresAt?: string }) => {
      const response = await api.patch(`/admin/doctor-verifications/${doctorId}`, data);
      return response.data;
  },

  downloadDoctorLicense: async (doctorId: string, reason: string) => {
      const response = await api.get(`/admin/doctor-verifications/${doctorId}/license`, { responseType: "blob", headers: { "X-Break-Glass-Reason": reason } });
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
