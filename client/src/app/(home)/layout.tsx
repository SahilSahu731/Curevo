"use client"

import React from 'react'
import Navbar from '@/components/common/Navbar'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
			<Navbar />
			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>
		</div>
	)
}

