import apiClient from "./client"
import type { User } from "@/store/authStore"

type AuthData = {
  user?: User
  mfaRequired?: boolean
  mfaEnrollmentRequired?: boolean
  emailVerificationRequired?: boolean
  session?: { mfaEnrollmentRequired?: boolean }
  recoveryCodes?: string[]
}

export const authAPI = {
  login: async (data: { email: string; password: string; remember?: boolean }) =>
    (await apiClient.post<{ data: AuthData }>("/auth/login", data)).data.data,

  register: async (data: FormData) =>
    (await apiClient.post<{ data: AuthData }>("/auth/register", data)).data.data,

  me: async () =>
    (await apiClient.get<{ data: AuthData }>("/auth/me")).data.data,

  logout: async () => apiClient.post("/auth/logout"),
  logoutAll: async () => apiClient.post("/auth/logout-all"),
  resendVerification: async () => apiClient.post("/auth/verify-email/resend"),
  verifyMfa: async (data: { code?: string; recoveryCode?: string }) =>
    (await apiClient.post<{ data: AuthData }>("/auth/mfa/verify", data)).data.data,
  setupMfa: async () =>
    (await apiClient.post<{ data: { secret: string; uri: string; expiresAt: string } }>("/auth/mfa/setup")).data.data,
  confirmMfa: async (code: string) =>
    (await apiClient.post<{ data: AuthData }>("/auth/mfa/confirm", { code })).data.data,
}
