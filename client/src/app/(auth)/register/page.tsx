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
import { Loader2, User, Stethoscope, Chrome } from 'lucide-react'

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'doctor'
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({ 
      mode: 'onBlur',
      defaultValues: { role: 'patient' }
  })
  const { register: registerUser, isLoading } = useAuth()
  const [githubLoading, setGithubLoading] = useState(false)

  // Watch role for conditional UI
  const selectedRole = watch('role');

  const password = watch('password')

  const onSubmit = async (data: FormValues) => {
    try {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('email', data.email)
      fd.append('password', data.password)
      fd.append('role', data.role)

      await registerUser(fd)
      router.push('/')
    } catch (err: any) {
       // handled by store
    }
  }

  const handleGoogleSignup = () => {
      setGithubLoading(true);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">Create an account</h1>
        <p className="text-muted-foreground font-body">
           Get started with SmartQueue today.
        </p>
      </div>

      <div className="space-y-4">
        <Button 
            variant="outline" 
            type="button"
            className="w-full h-11 font-medium relative bg-card text-foreground hover:bg-muted border-input" 
            disabled={isLoading || githubLoading} 
            onClick={handleGoogleSignup}
        >
            {githubLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Chrome className="h-4 w-4 mr-2" />}
            Sign up with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 gap-4">
            <div 
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'patient' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                onClick={() => setValue('role', 'patient')}
            >
                <div className={`p-2 rounded-full transition-colors ${selectedRole === 'patient' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <User className="h-5 w-5" />
                </div>
                <div className="text-center">
                    <div className={`font-bold text-sm ${selectedRole === 'patient' ? 'text-primary' : 'text-foreground'}`}>Patient</div>
                    <div className="text-[10px] text-muted-foreground">Book appointments</div>
                </div>
            </div>

            <div 
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${selectedRole === 'doctor' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}
                onClick={() => setValue('role', 'doctor')}
            >
                <div className={`p-2 rounded-full transition-colors ${selectedRole === 'doctor' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Stethoscope className="h-5 w-5" />
                </div>
                <div className="text-center">
                    <div className={`font-bold text-sm ${selectedRole === 'doctor' ? 'text-primary' : 'text-foreground'}`}>Doctor</div>
                    <div className="text-[10px] text-muted-foreground">Manage patients</div>
                </div>
            </div>
            
            {/* hidden input for form lib */}
            <input type="hidden" {...register('role')} />
        </div>


        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Full Name</Label>
          <Input id="name" placeholder="John Doe" className="h-11 bg-input/50 border-input text-foreground focus-visible:ring-primary" {...register('name', { required: 'Name is required' })} />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" className="h-11 bg-input/50 border-input text-foreground focus-visible:ring-primary" {...register('email', { required: 'Email is required' })} />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input id="password" type="password" className="h-11 bg-input/50 border-input text-foreground focus-visible:ring-primary" {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
              {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground">Confirm Password</Label>
              <Input id="confirm" type="password" className="h-11 bg-input/50 border-input text-foreground focus-visible:ring-primary" {...register('confirmPassword', { validate: val => val === password || 'Mismatch' })} />
              {errors.confirmPassword && <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>}
            </div>
        </div>

        <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
         Already have an account?{" "}
         <Link href="/login" className="font-bold text-primary hover:underline transition-all">
             Sign in
         </Link>
      </div>
    </div>
  )
}
