import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // We can also get token from localStorage if not using HttpOnly cookies
    // ex: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // However, if we rely on cookies (cred: true), we might not need this if browser handles it.
    // The prompt AuthController checks header OR cookie.
    
    // Let's assume we might need to attach token if stored in store, 
    // but store usually persists to localStorage.
    
    // Attack Bearer token from store if available
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
        // Handle logout or refresh
        useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
