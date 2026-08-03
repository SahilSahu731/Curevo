'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'
import { Loader2 } from 'lucide-react'

type FormValues = {
  email: string
  password: string
  remember: boolean
}

function safeRedirect(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : ''
}

function dashboardFor(role: string) {
  if (role === 'doctor') return '/doctor-dashboard'
  if (role === 'admin') return '/admin-dashboard'
  return '/patient-dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { remember: false },
  })
  const { login, verifyMfa, mfaRequired, mfaEnrollmentRequired, isLoading } = useAuth()
  const [mfaCode, setMfaCode] = useState('')
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState('')
  const onSubmit = async (data: FormValues) => {
    try {
      const user = await login(data)
      if (!user) return
      const requested = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('from') || new URLSearchParams(window.location.search).get('redirect')
        : null
      router.replace(mfaEnrollmentRequired ? '/mfa-setup' : (safeRedirect(requested) || dashboardFor(user.role)))
    } catch {
      // Error handled by store/toast
    }
  }

  const onMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const user = await verifyMfa({
        code: mfaCode || undefined,
        recoveryCode: mfaRecoveryCode || undefined,
      })
      const requested = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('from') || new URLSearchParams(window.location.search).get('redirect')
        : null
      router.replace(safeRedirect(requested) || dashboardFor(user.role))
    } catch {
      setMfaCode('')
      setMfaRecoveryCode('')
    }
  }

  if (mfaRequired) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">Verify your sign-in</h1>
          <p className="text-muted-foreground">Enter the six-digit code from your authenticator app.</p>
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
              onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="auth-input h-11 text-center text-lg tracking-[0.35em] text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mfa-recovery" className="text-foreground">Recovery code</Label>
            <Input
              id="mfa-recovery"
              autoComplete="off"
              value={mfaRecoveryCode}
              onChange={(event) => setMfaRecoveryCode(event.target.value.trim().toUpperCase())}
              className="auth-input h-11 text-foreground"
              placeholder="Use only if your authenticator is unavailable"
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading || (mfaCode.length !== 6 && mfaRecoveryCode.length < 8)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify and continue
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground font-body">
          Enter your credentials to access your account.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleAuthButton disabled={isLoading}>Continue with Google</GoogleAuthButton>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Continuing with Google records acceptance of the current <Link href="/terms" className="text-primary underline">Terms</Link> and <Link href="/privacy" className="text-primary underline">Privacy Notice</Link>.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="auth-divider-label px-2 text-muted-foreground font-medium">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="auth-input h-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            disabled={isLoading}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <div className="space-y-2">
           <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
           </div>
          <Input
            id="password"
            type="password"
            className="auth-input h-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={watch('remember')}
              onCheckedChange={(checked) => setValue('remember', checked === true)}
              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <input type="hidden" {...register('remember')} />
            <label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Remember me for 30 days
            </label>
        </div>

        <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
         Don&apos;t have an account?{" "}
         <Link href="/register" className="font-bold text-primary hover:underline transition-all">
             Sign up for free
         </Link>
      </div>
    </div>
  )
}
