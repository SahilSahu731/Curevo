import apiClient from "./client";
import { User } from "@/store/authStore";

interface LoginResponse {
  user: User;
  token: string;
}

export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: FormData) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  me: async (token?: string) => {
    const response = await apiClient.get<{ success: boolean; data: User }>("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data.data;
  },
};
