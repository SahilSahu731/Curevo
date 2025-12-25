import api from "../api";

export interface BookingData {
    doctorId: string;
    clinicId: string;
    date: Date;
    slotTime: string;
    symptoms?: string;
    priority?: 'normal' | 'emergency';
    consultationType?: 'in-person' | 'video';
}

export const patientService = {
    bookAppointment: async (data: BookingData) => {
        const response = await api.post("/patients/appointment", data);
        return response.data;
    },

    getMyAppointments: async (status?: string) => {
        const response = await api.get("/patients/appointments", { params: { status } });
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.delete(`/patients/appointment/${id}`);
        return response.data;
    },

    checkIn: async (id: string) => {
        const response = await api.post(`/patients/appointment/${id}/check-in`);
        return response.data;
    }
};
