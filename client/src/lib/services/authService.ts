import api from "../api";
import { User } from "@/store/authStore";

export const getMe = async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>("/auth/me");
    return data.data;
}
