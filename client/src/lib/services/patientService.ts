import api from "../api";

export interface BookingData {
    doctorId: string;
    clinicId: string;
    date: Date;
    slotTime: string;
    symptoms?: string;
    priority?: 'normal' | 'emergency';
}

export const patientService = {
    bookAppointment: async (data: BookingData) => {
        const response = await api.post("/patient/appointment", data);
        return response.data;
    },

    getMyAppointments: async (status?: string) => {
        const response = await api.get("/patient/appointments", { params: { status } });
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.delete(`/patient/appointment/${id}`);
        return response.data;
    }
};
