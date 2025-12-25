import api from "../api";
import { User } from "@/store/authStore";

export const getMe = async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>("/auth/me");
    return data.data;
    return data.data;
}

export const updateProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.put<{ data: User }>("/auth/updatedetails", data);
    return response.data.data;
}

export const updateProfileImage = async (formData: FormData): Promise<User> => {
    const response = await api.put<{ data: User }>("/auth/updateimage", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
}
