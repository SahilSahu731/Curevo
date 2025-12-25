import api from "../api";

export const userService = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    updateUser: async (id: string, data: any) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    getUserAppointments: async (id: string) => {
        const response = await api.get(`/admin/users/${id}/appointments`);
        return response.data;
    }
};
