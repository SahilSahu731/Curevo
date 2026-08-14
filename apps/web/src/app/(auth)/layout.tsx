"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Compass, Leaf, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { useAuthStore } from "@/store/authStore"

import "./auth.css"

function destinationFor(role: string) {
  if (role === "admin") return "/admin-dashboard"
  return "/dashboard"
}

function requestedDestination() {
  if (typeof window === "undefined") return ""

  const params = new URLSearchParams(window.location.search)
  const value = params.get("from") || params.get("redirect")
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : ""
}

const resetSteps = [
  {
    icon: Compass,
    label: "Name what is pulling you away",
    detail: "Notice the pattern without grading yourself.",
  },
  {
    icon: Leaf,
    label: "Choose one gentle next step",
    detail: "Turn a heavy moment into something you can begin.",
  },
  {
    icon: RotateCcw,
    label: "Return whenever you drift",
    detail: "A reset is always available. No streak required.",
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized, mfaEnrollmentRequired, getCurrentUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) {
      getCurrentUser()
      return
    }

    if (user) {
      if (mfaEnrollmentRequired) {
        router.replace("/mfa-setup")
        return
      }

      router.replace(requestedDestination() || destinationFor(user.role))
    }
  }, [getCurrentUser, initialized, mfaEnrollmentRequired, router, user])

  if (!initialized || user) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-foreground"
        role="status"
        aria-live="polite"
      >
        <BrandLogo />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          {user ? "Opening your space..." : "Checking your session..."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen bg-background font-body transition-colors duration-300 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
      <aside
        className="auth-story-panel relative hidden overflow-hidden border-r border-white/10 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"
        aria-label="About Curevo"
      >
        <div className="auth-story-grid absolute inset-0" aria-hidden="true" />
        <div className="auth-story-orb auth-story-orb-one" aria-hidden="true" />
        <div className="auth-story-orb auth-story-orb-two" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <Link href="/" className="w-fit rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <BrandLogo inverse />
            <span className="sr-only">Return to Curevo home</span>
          </Link>

          <div className="my-16 max-w-xl space-y-10">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <p className="auth-eyebrow">A private pause, made practical</p>
              <h2 className="max-w-lg font-heading text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white xl:text-6xl">
                Come back to what matters, one small reset at a time.
              </h2>
              <p className="max-w-lg text-base leading-7 text-white/72 xl:text-lg">
                Curevo gives you a quiet place to work through procrastination, scattered focus, and everyday overwhelm—without shame or impossible routines.
              </p>
            </motion.div>

            <div className="grid gap-3" aria-label="How Curevo helps">
              {resetSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.12 + index * 0.08, duration: 0.4 }}
                  className="auth-reset-step"
                >
                  <span className="auth-reset-icon" aria-hidden="true">
                    <step.icon className="size-4" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{step.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-white/58">{step.detail}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs leading-5 text-white/55">
            <span>Self-guided wellbeing tools—not diagnosis or emergency care.</span>
            <Link href="/privacy" className="transition-colors hover:text-white focus-visible:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white focus-visible:text-white">Terms</Link>
          </div>
        </div>
      </aside>

      <main className="auth-form-panel relative flex min-h-screen flex-col items-center justify-start px-6 pb-10 pt-28 transition-colors duration-300 md:px-12 lg:justify-center lg:py-12">
        <header className="absolute left-0 top-0 z-10 flex w-full items-center justify-between border-b border-border bg-background/88 p-5 backdrop-blur-md lg:hidden">
          <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <BrandLogo compact />
            <span className="sr-only">Return to Curevo home</span>
          </Link>
          <span className="max-w-32 text-right text-[11px] font-medium leading-4 text-muted-foreground">
            A gentler way back to focus
          </span>
        </header>

        <div className="auth-form-content w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
  )
}
