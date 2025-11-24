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
      const data = res?.data ?? res
      // expected: { user, token }
      if (data?.user && data?.token) {
        setUser(data.user, data.token)
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
      const data = res?.data ?? res
      if (data?.user && data?.token) {
        setUser(data.user, data.token)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })
}

export const useCurrentUser = () => {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)

  const query = useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      const res = await authService.me()
      return res?.data ?? res
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      // preserve token from store
      setUser(query.data, token as string)
    }
  }, [query.data, setUser, token])

  return query
}
