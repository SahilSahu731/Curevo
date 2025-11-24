'use client'

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/lib/services/authService'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/store/authStore'

export default function useAuth() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const queryClient = useQueryClient()

  // Login mutation
  const login = useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (res) => {
      const data = res?.data ?? res
      if (data?.user && data?.token) {
        setAuth(data.user, data.token)
      }
      // invalidate/freshen auth query
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })

  // Register mutation
  const register = useMutation({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: (res) => {
      const data = res?.data ?? res
      if (data?.user && data?.token) {
        setAuth(data.user, data.token)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth })
    },
  })

  // Logout function: clear store, clear query cache, optionally call backend
  const logout = useCallback(async () => {
    // Try server-side logout if available (best-effort)
    try {
      if (typeof authService.logout === 'function') {
        await authService.logout()
      }
    } catch (err) {
        console.log(err)
      // ignore network errors on logout
    }

    clearAuth()
    // clear cached server state to avoid leaking private data
    queryClient.clear()
  }, [clearAuth, queryClient])

  // Current user query (uses token from Zustand to control enabled state)
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth,
    queryFn: async () => {
      const res = await authService.getMe()
      return res?.data ?? res
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      // keep Zustand in sync if backend returned fresh user
      if (data?.user) {
        // if token wasn't returned, preserve existing token from store
        setAuth(data.user, data.token ?? token)
      }
    },
  })

  return {
    // raw data
    user,
    token,

    // mutations (objects returned by useMutation)
    login,
    register,

    // helper actions
    logout,

    // query (useful for status/loading/manual refetch)
    currentUserQuery,
  }
}
