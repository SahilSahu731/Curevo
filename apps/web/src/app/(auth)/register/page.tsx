"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Check, Loader2 } from "lucide-react"

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptedTerms: boolean
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

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: { acceptedTerms: false },
  })
  const { register: registerUser, isLoading } = useAuth()
  const password = watch("password")

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("role", "patient")
      formData.append("acceptedTerms", String(data.acceptedTerms))
      formData.append("policyVersion", "2026-08-03")

      const user = await registerUser(formData)
      const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search)
      const requested = params ? params.get("from") || params.get("redirect") : null
      router.replace(safeRedirect(requested) || destinationFor(user.role))
    } catch {
      // Error handled by store/toast.
    }
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2 text-center lg:text-left">
        <p className="auth-form-eyebrow">Start small</p>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-foreground">Create your personal space</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          A quiet account for reflection, focus resets, and kinder follow-through.
        </p>
      </div>

      <div className="auth-personal-note" role="note">
        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>Built for personal self-guided use. Curevo does not diagnose conditions or replace professional care.</p>
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
          <Label htmlFor="name" className="text-foreground">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Your name"
            disabled={isLoading}
            minLength={2}
            maxLength={80}
            className="auth-input h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Use at least 2 characters" },
              maxLength: { value: 80, message: "Use 80 characters or fewer" },
            })}
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={isLoading}
            className="auth-input h-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-describedby="password-hint"
              minLength={12}
              maxLength={128}
              disabled={isLoading}
              className="auth-input h-12 text-foreground focus-visible:ring-primary"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 12, message: "Use at least 12 characters" },
                maxLength: { value: 128, message: "Use 128 characters or fewer" },
              })}
            />
            <p id="password-hint" className="text-[11px] leading-4 text-muted-foreground">
              12–128 characters; avoid your name, email, and common passwords.
            </p>
            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              disabled={isLoading}
              className="auth-input h-12 text-foreground focus-visible:ring-primary"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptedTerms"
            checked={watch("acceptedTerms")}
            onCheckedChange={(checked) => setValue("acceptedTerms", checked === true, { shouldValidate: true })}
            disabled={isLoading}
          />
          <Label htmlFor="acceptedTerms" className="text-sm font-normal leading-5 text-muted-foreground">
            I have read and accept the <Link href="/terms" className="text-primary underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Notice</Link> (version 2026-08-03).
          </Label>
          <input type="hidden" {...register("acceptedTerms", { validate: (value) => value || "You must accept the current notices" })} />
        </div>
        {errors.acceptedTerms && <span className="block text-xs text-destructive">{errors.acceptedTerms.message}</span>}

        <Button type="submit" className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/15" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Create my space
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary transition-colors hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
