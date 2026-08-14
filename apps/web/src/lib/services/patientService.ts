import api from "../api";

export interface BookingData {
    doctorId: string;
    clinicId: string;
    date: Date | string;
    slotTime: string;
    symptoms?: string;
    priority?: 'normal' | 'emergency';
    consultationType?: 'in-person' | 'video';
    idempotencyKey?: string;
}

export const patientService = {
    bookAppointment: async (data: BookingData) => {
        const response = await api.post("/appointments", data, { headers: data.idempotencyKey ? { "Idempotency-Key": data.idempotencyKey } : undefined });
        return response.data;
    },

    getMyAppointments: async (status?: string) => {
        const response = await api.get("/patients/appointments", { params: { status } });
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },

    checkIn: async (id: string) => {
        const response = await api.post("/queue/join", { appointmentId: id });
        return response.data;
    },

    getAppointment: async (id: string) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    getTelehealthSession: async (id: string) => {
        const response = await api.get(`/appointments/${id}/telehealth`);
        return response.data;
    }
};
