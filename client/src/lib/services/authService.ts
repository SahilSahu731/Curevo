import api from "../api";
import { User } from "@/store/authStore";

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data),

  register: (data: FormData) =>
    api.post("/auth/register", data),

  me: () => api.get<User>("/auth/me"),
};
