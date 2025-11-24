import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authService } from '@/lib/services/authService'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/authStore'

/**
 * useLogin: mutation to login user
 * useRegister: mutation to register user
 * useCurrentUser: query to fetch current user (/auth/me)
 */
export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authService.login(credentials),
    onSuccess: (res: any) => {
      const payload = res?.data ?? res
      // server returns { success, token, data: user }
      const token = payload?.token
      const user = payload?.data ?? payload?.user
      if (user && token) {
        setUser(user, token)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })
}

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) => authService.register(payload),
    onSuccess: (res: any) => {
      const payload = res?.data ?? res
      const token = payload?.token
      const user = payload?.data ?? payload?.user
      if (user && token) {
        setUser(user, token)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })
}

export const useCurrentUser = () => {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const currentUser = useAuthStore((s) => s.user)

  const query = useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      const res = await authService.me()
      // server returns { success, data: user }
      const anyRes = res as any
      return anyRes?.data?.data ?? anyRes?.data ?? res
    },
    // allow this query to run even if the in-memory token is not set
    // so that cookie-based (httpOnly) sessions are recognized
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
  })

  // Only write into the Zustand store if the fetched user differs or store is empty.
  useEffect(() => {
    if (query.data) {
      const userData = query.data
      if (!currentUser || (userData && currentUser._id !== userData._id)) {
        // when authenticating via cookie, token may not exist in the store
        setUser(userData, token ?? null as any)
      }
    }
  }, [query.data, setUser, token, currentUser])

  return query
}
