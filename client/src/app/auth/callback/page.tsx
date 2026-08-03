"use client"

import { useEffect, useRef, useState } from "react"
import { HeartPulse, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuthStore, type User } from "@/store/authStore"

function dashboardFor(user: User) {
  if (user.role === "doctor") return "/doctor-dashboard"
  if (user.role === "admin") return "/admin-dashboard"
  return "/patient-dashboard"
}

export default function GoogleAuthCallbackPage() {
  const router = useRouter()
  const completeGoogleAuth = useAuthStore((state) => state.completeGoogleAuth)
  const started = useRef(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (started.current) return
    started.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const token = params.get("token")
    window.history.replaceState(null, "", window.location.pathname)

    if (!token) {
      queueMicrotask(() => setError("Google did not return a valid sign-in token."))
      return
    }

    completeGoogleAuth(token)
      .then((user) => router.replace(dashboardFor(user)))
      .catch(() => setError("We could not finish signing you in. Please try again."))
  }, [completeGoogleAuth, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {error ? <HeartPulse className="size-6" /> : <Loader2 className="size-6 animate-spin" />}
        </div>
        <div>
          <h1 className="text-xl font-bold">{error ? "Google sign-in failed" : "Finishing your sign-in"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "One moment while we securely connect your account."}
          </p>
        </div>
        {error && (
          <button className="text-sm font-semibold text-primary hover:underline" onClick={() => router.replace("/login")}>
            Return to sign in
          </button>
        )}
      </div>
    </main>
  )
}
