"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import apiClient from "@/api/client"

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search || window.location.hash.slice(1)).get("token")
    window.history.replaceState(null, "", window.location.pathname)
    if (!token) {
      setMessage("This verification link is missing its token.")
      return
    }
    apiClient.post("/auth/verify-email", { token })
      .then(() => setMessage("Your email is verified. You can return to Curevo."))
      .catch((error) => setMessage(error.response?.data?.error || "This verification link is invalid or expired."))
  }, [])

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground"><section className="space-y-4"><h1 className="text-3xl font-bold">Email verification</h1><p className="text-muted-foreground">{message}</p><Link href="/login" className="text-primary hover:underline">Return to sign in</Link></section></main>
}
