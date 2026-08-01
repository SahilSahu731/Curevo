import api from "../api";

export interface PrescriptionItem {
  medicine: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface MedicalRecord {
  _id: string;
  diagnosis: string;
  symptoms?: string;
  prescription: PrescriptionItem[];
  treatmentPlan?: string;
  doctorNotes?: string;
  followUpDate?: string;
  createdAt: string;
  patientId: {
    _id: string;
    name: string;
    email?: string;
  };
  doctorId: {
    _id: string;
    userId?: {
      name: string;
      profileImage?: string;
    };
  };
  appointmentId?: {
    date: string;
    slotTime: string;
    tokenNumber: number;
    consultationType?: string;
    clinicId?: {
      name: string;
      address?: string;
      city?: string;
    };
  };
}

export const medicalRecordService = {
  getRecords: async (params?: { patientId?: string }) => {
    const response = await api.get("/medical-records", { params });
    return response.data;
  },

  getRecord: async (id: string) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  createRecord: async (data: Record<string, unknown>) => {
    const response = await api.post("/medical-records", data);
    return response.data;
  },

  updateRecord: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/medical-records/${id}`, data);
    return response.data;
  },
};
