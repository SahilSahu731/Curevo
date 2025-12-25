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
import { Loader2, Chrome } from 'lucide-react'

type FormValues = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ mode: 'onBlur' })
  const { login, isLoading } = useAuth()
  const [githubLoading, setGithubLoading] = useState(false)

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data)
      router.push('/')
    } catch (err: any) {
      console.log(err)
      // Error handled by store/toast
    }
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
        <Button variant="outline" className="w-full h-11 font-medium relative bg-card text-foreground hover:bg-muted border-input" disabled={isLoading || githubLoading} onClick={() => setGithubLoading(true)}>
            {githubLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Chrome className="h-4 w-4 mr-2" />}
            Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-11 bg-input/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
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
            className="h-11 bg-input/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
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
