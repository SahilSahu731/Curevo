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

  getFeedback: async (params?: { page?: number; limit?: number; status?: string; category?: string; search?: string; sortOrder?: string }) => {
      const response = await api.get("/admin/feedback", { params });
      return response.data;
  },

  updateFeedback: async (id: string, data: { status?: string; priority?: string; adminResponse?: string }) => {
      const response = await api.patch(`/admin/feedback/${id}`, data);
      return response.data;
  },

  getSupportTickets: async (params?: { page?: number; limit?: number; status?: string; category?: string; search?: string; sortOrder?: string }) => {
      const response = await api.get("/admin/support-tickets", { params });
      return response.data;
  },

  updateSupportTicket: async (id: string, status: "accepted" | "in-review" | "resolved" | "closed") => {
      const response = await api.patch(`/admin/support-tickets/${id}`, { status });
      return response.data;
  }
};
