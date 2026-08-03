"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import apiClient from "@/api/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await apiClient.post<{ message?: string }>("/auth/forgot-password", { email })
      setMessage(response.data.message || "If the account can use password recovery, an email will be sent.")
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || "We could not process that request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground">Enter your email and we will send a time-limited reset link if recovery is available.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email</Label>
            <Input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          {message && <p className="text-sm text-primary">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</Button>
        </form>
        <Link href="/login" className="block text-center text-sm text-primary hover:underline">Return to sign in</Link>
      </section>
    </main>
  )
}
