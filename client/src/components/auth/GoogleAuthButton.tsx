"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.86a6.02 6.02 0 0 1 0-3.72V7.52H3.06a10 10 0 0 0 0 8.96l3.34-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.52l3.34 2.62C7.19 7.77 9.4 6.01 12 6.01Z" />
    </svg>
  )
}

function getGoogleAuthUrl() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
    .replace(/\/+$/, "")
  const url = new URL(`${apiBase}/auth/google`)
  const current = new URL(window.location.href)
  const redirect = current.searchParams.get("redirect") || current.searchParams.get("from")
  if (redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")) {
    url.searchParams.set("redirect", redirect)
  }
  return url.toString()
}

export function GoogleAuthButton({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const startGoogleAuth = () => {
    setIsRedirecting(true)
    window.location.assign(getGoogleAuthUrl())
  }

  return (
    <Button
      variant="outline"
      type="button"
      className="auth-google-button h-11 w-full font-medium"
      disabled={disabled || isRedirecting}
      onClick={startGoogleAuth}
    >
      {isRedirecting ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
      {children}
    </Button>
  )
}
