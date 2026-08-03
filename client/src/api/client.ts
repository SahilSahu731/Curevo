import axios, { AxiosError } from "axios"
import { getCsrfToken } from "./csrf"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15_000,
  maxContentLength: 10 * 1024 * 1024,
  maxBodyLength: 10 * 1024 * 1024,
})

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toUpperCase()
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    config.headers.set("X-CSRF-Token", await getCsrfToken())
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const { clearSessionState } = await import("@/store/authStore")
      clearSessionState()
      const requestUrl = error.config?.url || ""
      const publicAuthRequest = [
        "/auth/me",
        "/auth/csrf",
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/verify-email",
        "/auth/change-email/confirm",
        "/auth/mfa/verify",
      ]
        .some((path) => requestUrl.includes(path))
      if (!publicAuthRequest) window.location.assign(`/login?from=${encodeURIComponent(window.location.pathname)}`)
    }
    return Promise.reject(error)
  },
)

export default apiClient
