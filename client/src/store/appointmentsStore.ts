import { create } from "zustand";
import { appointmentsAPI, Appointment } from "@/api";
import toast from "react-hot-toast";

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  
  fetchAppointments: () => Promise<void>;
  createAppointment: (data: Partial<Appointment>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  isLoading: false,

  fetchAppointments: async () => {
    try {
      set({ isLoading: true });
      const appointments = await appointmentsAPI.getAll();
      set({ appointments, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    }
  },

  createAppointment: async (data) => {
    try {
      set({ isLoading: true });
      const newAppointment = await appointmentsAPI.create(data);
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }));
      toast.success("Appointment created successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to create appointment");
      throw error;
    }
  },

  updateAppointment: async (id, data) => {
    try {
      set({ isLoading: true });
      const updatedAppointment = await appointmentsAPI.update(id, data);
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === id ? updatedAppointment : apt
        ),
        isLoading: false,
      }));
      toast.success("Appointment updated successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to update appointment");
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      set({ isLoading: true });
      await appointmentsAPI.delete(id);
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt._id !== id),
        isLoading: false,
      }));
      toast.success("Appointment deleted successfully!");
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to delete appointment");
      throw error;
    }
  },
}));