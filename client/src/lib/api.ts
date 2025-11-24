import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Don't force a redirect for unauthenticated checks like `/auth/me`.
      // Some requests (e.g. the client-side /auth/me) are expected to return 401
      // when the user is not logged in — redirecting on those causes a reload loop.
      const cfg = error.config as AxiosRequestConfig & { skipAuthRedirect?: boolean } | undefined
      const requestUrl = cfg?.url ?? ''

      // Logout locally to clear any stale store state
      useAuthStore.getState().logout();

      // Only perform a hard redirect for explicit protected actions —
      // skip redirect for /auth/me or requests that include `skipAuthRedirect` flag.
      const skipRedirect = requestUrl.includes('/auth/me') || !!cfg?.skipAuthRedirect

      if (!skipRedirect && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error);
  }
);

export default api;
