import { create } from "zustand";
import { clinicsAPI, Clinic } from "@/api";
import toast from "react-hot-toast";

interface ClinicsState {
  clinics: Clinic[];
  isLoading: boolean;
  
  fetchClinics: () => Promise<void>;
  createClinic: (data: Partial<Clinic>) => Promise<void>;
  updateClinic: (id: string, data: Partial<Clinic>) => Promise<void>;
  deleteClinic: (id: string) => Promise<void>;
}

export const useClinicsStore = create<ClinicsState>((set, get) => ({
  clinics: [],
  isLoading: false,

  fetchClinics: async () => {
    try {
      set({ isLoading: true });
      const clinics = await clinicsAPI.getAll();
      set({ clinics, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch clinics");
    }
  },

  createClinic: async (data) => {
    try {
      set({ isLoading: true });
      const newClinic = await clinicsAPI.create(data);
      set((state) => ({
        clinics: [...state.clinics, newClinic],
        isLoading: false,
      }));
      toast.success("Clinic created successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to create clinic");
      throw error;
    }
  },

  updateClinic: async (id, data) => {
    try {
      set({ isLoading: true });
      const updatedClinic = await clinicsAPI.update(id, data);
      set((state) => ({
        clinics: state.clinics.map((clinic) =>
          clinic._id === id ? updatedClinic : clinic
        ),
        isLoading: false,
      }));
      toast.success("Clinic updated successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to update clinic");
      throw error;
    }
  },

  deleteClinic: async (id) => {
    try {
      set({ isLoading: true });
      await clinicsAPI.delete(id);
      set((state) => ({
        clinics: state.clinics.filter((clinic) => clinic._id !== id),
        isLoading: false,
      }));
      toast.success("Clinic deleted successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to delete clinic");
      throw error;
    }
  },
}));