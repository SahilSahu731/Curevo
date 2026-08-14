"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

type FormValues = {
  email: string
  password: string
  remember: boolean
}

function safeRedirect(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : ""
}

function destinationFor(role: string) {
  if (role === "doctor") return "/doctor-dashboard"
  if (role === "admin") return "/admin-dashboard"
  return "/"
}

function requestedDestination() {
  if (typeof window === "undefined") return ""

  const params = new URLSearchParams(window.location.search)
  return safeRedirect(params.get("from") || params.get("redirect"))
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { remember: false },
  })
  const { login, verifyMfa, mfaRequired, mfaEnrollmentRequired, isLoading } = useAuth()
  const [mfaCode, setMfaCode] = useState("")
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState("")

  const onSubmit = async (data: FormValues) => {
    try {
      const user = await login(data)
      if (!user) return

      router.replace(mfaEnrollmentRequired ? "/mfa-setup" : (requestedDestination() || destinationFor(user.role)))
    } catch {
      // Error handled by store/toast.
    }
  }

  const onMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const user = await verifyMfa({
        code: mfaCode || undefined,
        recoveryCode: mfaRecoveryCode || undefined,
      })
      router.replace(requestedDestination() || destinationFor(user.role))
    } catch {
      setMfaCode("")
      setMfaRecoveryCode("")
    }
  }

  if (mfaRequired) {
    return (
      <div className="space-y-7">
        <div className="space-y-2 text-center lg:text-left">
          <p className="auth-form-eyebrow">One more secure step</p>
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-foreground">Verify your sign-in</h1>
          <p className="text-sm leading-6 text-muted-foreground">Enter the six-digit code from your authenticator app, or use a recovery code.</p>
        </div>

        <form onSubmit={onMfaSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mfa-code" className="text-foreground">Authentication code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="auth-input h-12 text-center text-lg tracking-[0.35em] text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfa-recovery" className="text-foreground">Recovery code</Label>
            <Input
              id="mfa-recovery"
              autoComplete="off"
              value={mfaRecoveryCode}
              onChange={(event) => setMfaRecoveryCode(event.target.value.trim().toUpperCase())}
              className="auth-input h-12 text-foreground"
              placeholder="Use if your authenticator is unavailable"
            />
          </div>

          <Button type="submit" className="h-12 w-full" disabled={isLoading || (mfaCode.length !== 6 && mfaRecoveryCode.length < 8)}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Verify and continue
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2 text-center lg:text-left">
        <p className="auth-form-eyebrow">Welcome back</p>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-foreground">Return to your space</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Pick up gently from wherever you left off.
        </p>
      </div>

      <div className="space-y-3">
        <GoogleAuthButton disabled={isLoading}>Continue with Google</GoogleAuthButton>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Continuing with Google records acceptance of the current <Link href="/terms" className="text-primary underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Notice</Link>.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="auth-divider-label px-3 font-medium tracking-[0.12em] text-muted-foreground">Or use email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="auth-input h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            disabled={isLoading}
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="auth-input h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            placeholder="Your password"
            disabled={isLoading}
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </div>

        <div className="flex items-center gap-2.5">
          <Checkbox
            id="remember"
            checked={watch("remember")}
            onCheckedChange={(checked) => setValue("remember", checked === true)}
            className="border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <input type="hidden" {...register("remember")} />
          <label htmlFor="remember" className="text-sm leading-none text-muted-foreground">
            Keep me signed in for 30 days
          </label>
        </div>

        <Button type="submit" className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/15" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Curevo?{" "}
        <Link href="/register" className="font-semibold text-primary transition-colors hover:underline">
          Create your space
        </Link>
      </p>
    </div>
  )
}
