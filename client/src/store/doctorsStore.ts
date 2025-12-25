import { create } from "zustand";
import { doctorsAPI, Doctor } from "@/api/doctors";
import toast from "react-hot-toast";

interface DoctorsState {
  doctors: Doctor[];
  isLoading: boolean;
  
  fetchDoctors: () => Promise<void>;
  fetchDoctorsByClinic: (clinicId: string) => Promise<void>;
  createDoctor: (data: Partial<Doctor>) => Promise<void>;
  updateDoctor: (id: string, data: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
}

export const useDoctorsStore = create<DoctorsState>((set, get) => ({
  doctors: [],
  isLoading: false,

  fetchDoctors: async () => {
    try {
      set({ isLoading: true });
      const doctors = await doctorsAPI.getAll();
      set({ doctors, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
    }
  },

  fetchDoctorsByClinic: async (clinicId) => {
    try {
      set({ isLoading: true });
      const doctors = await doctorsAPI.getByClinic(clinicId);
      set({ doctors, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch doctors");
    }
  },

  createDoctor: async (data) => {
    try {
      set({ isLoading: true });
      const newDoctor = await doctorsAPI.create(data);
      set((state) => ({
        doctors: [...state.doctors, newDoctor],
        isLoading: false,
      }));
      toast.success("Doctor created successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to create doctor");
      throw error;
    }
  },

  updateDoctor: async (id, data) => {
    try {
      set({ isLoading: true });
      const updatedDoctor = await doctorsAPI.update(id, data);
      set((state) => ({
        doctors: state.doctors.map((doctor) =>
          doctor._id === id ? updatedDoctor : doctor
        ),
        isLoading: false,
      }));
      toast.success("Doctor updated successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to update doctor");
      throw error;
    }
  },

  deleteDoctor: async (id) => {
    try {
      set({ isLoading: true });
      await doctorsAPI.delete(id);
      set((state) => ({
        doctors: state.doctors.filter((doctor) => doctor._id !== id),
        isLoading: false,
      }));
      toast.success("Doctor deleted successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to delete doctor");
      throw error;
    }
  },
}));