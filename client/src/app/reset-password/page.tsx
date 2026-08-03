"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import apiClient from "@/api/client"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.slice(1))
    setToken(params.get("token") || "")
    window.history.replaceState(null, "", window.location.pathname)
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password !== confirmation) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const response = await apiClient.post<{ message?: string }>("/auth/reset-password", { token, password })
      setMessage(response.data.message || "Password reset complete. Sign in again.")
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || "This reset link is invalid or expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Choose a new password</h1>
          <p className="text-muted-foreground">Use at least 12 characters. All existing sessions will be signed out.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" /></div>
          {message && <p className="text-sm text-primary">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !token}>{loading ? "Updating..." : "Update password"}</Button>
        </form>
        <Link href="/login" className="block text-center text-sm text-primary hover:underline">Return to sign in</Link>
      </section>
    </main>
  )
}
