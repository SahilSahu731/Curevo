'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'


type Options = {
  role?: 'patient' | 'doctor' | 'admin'
  redirectTo?: string
  redirectIfAuthenticated?: boolean
}

export default function useRequireAuth(opts: Options = {}) {
  const { role, redirectTo = '/login', redirectIfAuthenticated = false } = opts
  const router = useRouter()
  const { token, user, isLoading, getCurrentUser } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const verifyAuth = async () => {
      // 1. If no token, redirect immediately
      if (!token) {
        if (!redirectIfAuthenticated) {
             router.replace(redirectTo)
        }
        setChecking(false)
        return
      }

      // 2. If token exists but no user (and not loading), try fetching user
      if (!user) {
         try {
             await getCurrentUser();
             // After fetch, if user is still null (e.g. invalid token), store handles logout
             // We can re-check user here if we want, but store updates are async in React state terms
         } catch (e) {
             // Store handles logout on error
             return;
         }
      }
      
      // 3. Authenticated logic
      if (redirectIfAuthenticated) {
         if (user?.role === 'doctor') router.replace('/doctor-dashboard')
         else if (user?.role === 'patient') router.replace('/patient-dashboard')
         else if (user?.role === 'admin') router.replace('/admin-dashboard')
         else router.replace('/')
         return
      }

      // 4. Role check
      if (role && user) {
          if (user.role !== role) {
              router.replace('/')
          }
      }
      
      setChecking(false)
    }

    verifyAuth();
  }, [token, user, role, redirectIfAuthenticated, redirectTo, getCurrentUser, router])

  return { checking, user, token }
}
