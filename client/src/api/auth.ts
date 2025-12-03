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

  me: async () => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};