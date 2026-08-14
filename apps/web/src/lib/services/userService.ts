import api from "../api";

export const userService = {
    getAllUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUser: async (id: string, data: any) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string, data: { targetEmail: string; reason: string }) => {
        const response = await api.delete(`/admin/users/${id}`, { data });
        return response.data;
    },

    getUserAppointments: async (id: string, reason: string) => {
        const response = await api.get(`/admin/users/${id}/appointments`, { headers: { "X-Break-Glass-Reason": reason } });
        return response.data;
    }
};
