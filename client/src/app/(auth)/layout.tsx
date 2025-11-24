"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'


export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const {user} = useAuthStore();
    const router = useRouter()

    useEffect(()=> {
      if (user) router.replace('/')
    }, [user, router])
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 auth-card shadow-lg overflow-hidden h-[88vh] md:h-[88vh]">
        <aside className="hidden md:flex flex-col items-center justify-center auth-illustration p-8">
          <div className="w-full h-full flex items-center justify-center">
            <Image src="/auth-illustration.svg" alt="Auth illustration" width={520} height={520} className="rounded-lg shadow-lg" priority />
          </div>
        </aside>

        <main className="p-6 md:p-12 flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  )
}
