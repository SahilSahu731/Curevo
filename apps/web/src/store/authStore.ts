import { create } from "zustand"
import { authAPI } from "@/api/auth"
import { clearCsrfToken } from "@/api/csrf"

export interface User {
  _id: string
  name: string
  email: string
  emailVerifiedAt?: string
  role: "member" | "admin"
  status?: "active" | "suspended"
  provider?: "local" | "google" | "facebook"
  profileImage?: string
  phone?: string
  gender?: "male" | "female" | "other"
  dateOfBirth?: string
  bio?: string
  mfa?: { enabled: boolean; enabledAt?: string }
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  initialized: boolean
  mfaRequired: boolean
  mfaEnrollmentRequired: boolean
  setUser: (user: User) => void
  login: (credentials: { email: string; password: string; remember?: boolean }) => Promise<User | null>
  register: (data: FormData) => Promise<User>
  completeGoogleAuth: () => Promise<User>
  verifyMfa: (data: { code?: string; recoveryCode?: string }) => Promise<User>
  getCurrentUser: () => Promise<User | null>
  updateUser: (updatedUser: Partial<User>) => void
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  _hydrated: boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  initialized: false,
  mfaRequired: false,
  mfaEnrollmentRequired: false,
  _hydrated: true,

  setUser: (user) => set({ user, isLoading: false, initialized: true, mfaRequired: false }),

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const data = await authAPI.login(credentials)
      if (data.mfaRequired) {
        set({ isLoading: false, mfaRequired: true, mfaEnrollmentRequired: false, user: null, initialized: true })
        return null
      }
      if (!data.user) throw new Error("Sign-in response did not include a user")
      set({ user: data.user, isLoading: false, initialized: true, mfaRequired: false, mfaEnrollmentRequired: Boolean(data.mfaEnrollmentRequired) })
      return data.user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (formData) => {
    set({ isLoading: true })
    try {
      const data = await authAPI.register(formData)
      if (!data.user) throw new Error("Registration response did not include a user")
      get().setUser(data.user)
      return data.user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  completeGoogleAuth: async () => {
    set({ isLoading: true })
    try {
      const data = await authAPI.me()
      if (!data.user) throw new Error("Google sign-in could not be completed")
      set({ user: data.user, isLoading: false, initialized: true, mfaRequired: false, mfaEnrollmentRequired: Boolean(data.session?.mfaEnrollmentRequired) })
      return data.user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  verifyMfa: async (values) => {
    set({ isLoading: true })
    try {
      const data = await authAPI.verifyMfa(values)
      if (!data.user) throw new Error("MFA verification did not include a user")
      get().setUser(data.user)
      set({ mfaEnrollmentRequired: false })
      return data.user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const data = await authAPI.me()
      if (!data.user) throw new Error("No active session")
      set({ user: data.user, isLoading: false, initialized: true, mfaRequired: false, mfaEnrollmentRequired: Boolean(data.session?.mfaEnrollmentRequired) })
      return data.user
    } catch {
      set({ user: null, initialized: true, isLoading: false, mfaRequired: false, mfaEnrollmentRequired: false })
      return null
    }
  },

  updateUser: (updatedUser) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedUser } : null,
  })),

  logout: async () => {
    try {
      await authAPI.logout()
    } finally {
      clearSessionState(true)
    }
  },

  logoutAll: async () => {
    try {
      await authAPI.logoutAll()
    } finally {
      clearSessionState(true)
    }
  },
}))

export function clearSessionState(broadcast = false) {
  useAuthStore.setState({ user: null, isLoading: false, initialized: true, mfaRequired: false, mfaEnrollmentRequired: false })
  clearCsrfToken()
  import("@/app/providers").then(({ queryClient }) => queryClient.clear()).catch(() => {})
  if (broadcast && typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("curevo-auth")
    channel.postMessage({ type: "logout" })
    channel.close()
  }
}

export const useIsAuthenticated = () => useAuthStore((state) => Boolean(state.user))
