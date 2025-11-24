'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCurrentUser } from '@/hooks/queries/useAuthQueries'

type Options = {
  role?: 'patient' | 'doctor' | 'admin'
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

export default function useRequireAuth(opts: Options = {}) {
  const { role, redirectTo = '/login', redirectIfAuthenticated = false } = opts
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [checking, setChecking] = useState(true)

  // Fetch current user if token exists but user is missing
  const currentUserQuery = useCurrentUser()

  useEffect(() => {
    // only run client-side
    if (typeof window === 'undefined') return

    // If user is authenticated and we want to prevent access to auth pages
    if (redirectIfAuthenticated && token) {
      // Redirect to dashboard (role-based)
      if (user?.role === 'doctor') router.replace('/doctor/dashboard')
      else router.replace('/patient/dashboard')
      return
    }

    // If no token, redirect to login
    if (!token) {
      router.replace(redirectTo)
      return
    }

    // If role is required, wait until currentUserQuery finishes
    if (role) {
      if (currentUserQuery.isLoading) {
        setChecking(true)
        return
      }

      const fetchedUser = currentUserQuery.data
      const effectiveUser = user ?? fetchedUser
      if (!effectiveUser) {
        router.replace(redirectTo)
        return
      }
      if (effectiveUser.role !== role) {
        // Role mismatch - redirect to home
        router.replace('/')
        return
      }
    }

    setChecking(false)
  }, [token, user, currentUserQuery.isLoading, currentUserQuery.data, role, redirectIfAuthenticated])

  return { checking, user, token }
}
