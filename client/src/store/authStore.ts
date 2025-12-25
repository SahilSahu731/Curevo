import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/api/auth";
import toast from "react-hot-toast";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  profileImage?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setUser: (user: User, token: string | null) => void;
  logout: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: FormData) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  _hydrated: boolean;
}

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  _hydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user, token) => {
        console.log("Setting user:", user);
        set({
          user,
          token,
          isLoading: false,
        })
      },

      logout: () => set(initialState),

      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.login(credentials);
          const { user, token } = response;
          get().setUser(user, token);
          toast.success("Login successful!");
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || "Login failed");
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authAPI.register(data);
          const { user, token } = response;
          get().setUser(user, token);
          toast.success("Registration successful!");
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || "Registration failed");
          throw error;
        }
      },

      getCurrentUser: async () => {
        try {
          const user = await authAPI.me();
          const { token } = get();
          get().setUser(user, token);
        } catch (error) {
          get().logout();
        }
      },

      updateUser: (updatedUser: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      }
    }),
    { 
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrated state:", state);
        if (state) state._hydrated = true;
      }
    }
  )
);

export const useIsAuthenticated = () => useAuthStore((state) => !!state.token);
