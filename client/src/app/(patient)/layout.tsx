'use client'

import React from 'react'
import useRequireAuth from '@/hooks/useRequireAuth'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useRequireAuth({ role: 'patient' })

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: 'var(--background)' }}>
      {children}
    </div>
  )
}
