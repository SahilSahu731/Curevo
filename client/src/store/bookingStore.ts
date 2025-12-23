import { create } from "zustand";

interface BookingState {
  clinicId: string | null;
  doctorId: string | null;
  doctorName: string | null;
  clinicName: string | null;
  date: Date | null;
  slotTime: string | null;
  steps: number;
  
  setClinic: (id: string, name: string) => void;
  setDoctor: (id: string, name: string) => void;
  setDate: (date: Date) => void;
  setSlot: (time: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  clinicId: null,
  doctorId: null,
  doctorName: null,
  clinicName: null,
  date: null,
  slotTime: null,
  steps: 1,

  setClinic: (id, name) => set({ clinicId: id, clinicName: name }),
  setDoctor: (id, name) => set({ doctorId: id, doctorName: name }),
  setDate: (date) => set({ date }),
  setSlot: (time) => set({ slotTime: time }),
  nextStep: () => set((state) => ({ steps: state.steps + 1 })),
  prevStep: () => set((state) => ({ steps: Math.max(1, state.steps - 1) })),
  reset: () => set({ 
      clinicId: null, doctorId: null, doctorName: null, clinicName: null, 
      date: null, slotTime: null, steps: 1 
  }),
}));
