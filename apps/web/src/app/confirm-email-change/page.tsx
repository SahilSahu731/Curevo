"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import apiClient from "@/api/client"

export default function ConfirmEmailChangePage() {
  const [message, setMessage] = useState("Processing confirmation...")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search || window.location.hash.slice(1)).get("token")
    window.history.replaceState(null, "", window.location.pathname)
    if (!token) {
      setMessage("This confirmation link is missing its token.")
      return
    }
    apiClient.post<{ data?: { completed?: boolean } }>("/auth/change-email/confirm", { token })
      .then(({ data }) => setMessage(data.data?.completed ? "Your email address has been changed." : "This address is confirmed. Confirm the other email to finish the change."))
      .catch((error) => setMessage(error.response?.data?.error || "This confirmation link is invalid or expired."))
  }, [])

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground"><section className="space-y-4"><h1 className="text-3xl font-bold">Email change</h1><p className="text-muted-foreground">{message}</p><Link href="/profile" className="text-primary hover:underline">Return to profile</Link></section></main>
}
