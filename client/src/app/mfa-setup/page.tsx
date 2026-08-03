"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authAPI } from "@/api/auth"
import { useAuthStore } from "@/store/authStore"

export default function MfaSetupPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [secret, setSecret] = useState("")
  const [uri, setUri] = useState("")
  const [code, setCode] = useState("")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    authAPI.setupMfa().then((data) => {
      setSecret(data.secret)
      setUri(data.uri)
    }).catch((requestError) => setError(requestError.response?.data?.error || "MFA setup could not start."))
  }, [])

  async function confirm() {
    setLoading(true)
    setError("")
    try {
      const data = await authAPI.confirmMfa(code)
      if (data.user) updateUser(data.user)
      setRecoveryCodes(data.recoveryCodes || [])
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || "That code was not accepted.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl space-y-6">
        <div className="space-y-2"><h1 className="text-3xl font-bold">Set up administrator MFA</h1><p className="text-muted-foreground">Add this account to an authenticator app, then confirm one six-digit code. Keep the recovery codes somewhere safe.</p></div>
        {recoveryCodes.length ? <div className="space-y-4"><p className="font-semibold text-primary">Save these one-time recovery codes now.</p><pre className="overflow-auto rounded-lg border border-border bg-muted p-4 text-sm">{recoveryCodes.join("\n")}</pre><Button className="w-full" onClick={() => router.replace("/admin-dashboard")}>Continue to dashboard</Button></div> : <div className="space-y-5"><div className="space-y-2"><Label>Manual setup key</Label><code className="block break-all rounded-lg border border-border bg-muted p-3 text-sm">{secret || "Loading..."}</code></div><div className="space-y-2"><Label>Authenticator URI</Label><code className="block max-h-24 overflow-auto break-all rounded-lg border border-border bg-muted p-3 text-xs">{uri || "Loading..."}</code></div><div className="space-y-2"><Label htmlFor="mfa-setup-code">Six-digit code</Label><Input id="mfa-setup-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} /></div>{error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full" onClick={confirm} disabled={loading || code.length !== 6}>{loading ? "Confirming..." : "Enable MFA"}</Button></div>}
      </section>
    </main>
  )
}
