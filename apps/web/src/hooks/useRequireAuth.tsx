'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

type Options = {
  role?: 'member' | 'admin'
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

const dashboardFor = (role?: string) => {
  if (role === 'admin') return '/admin-dashboard'
  return '/dashboard'
}

export default function useRequireAuth({ role, redirectTo = '/login', redirectIfAuthenticated = false }: Options = {}) {
  const router = useRouter()
  const { user, initialized, mfaEnrollmentRequired, getCurrentUser } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      getCurrentUser()
      return
    }
    if (mfaEnrollmentRequired) {
      router.replace('/mfa-setup')
    } else if (redirectIfAuthenticated && user) {
      router.replace(dashboardFor(user.role))
    } else if (!redirectIfAuthenticated && !user) {
      router.replace(redirectTo)
    } else if (role && user?.role !== role) {
      router.replace(dashboardFor(user?.role))
    }
  }, [getCurrentUser, initialized, mfaEnrollmentRequired, redirectIfAuthenticated, redirectTo, role, router, user])

  return {
    checking: !initialized || (!redirectIfAuthenticated && !user) || Boolean(role && user && user.role !== role) || mfaEnrollmentRequired,
    user,
  }
}
