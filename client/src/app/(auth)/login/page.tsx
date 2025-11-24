'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import FormError from '@/components/common/FormError'
import { useLogin } from '@/hooks/queries/useAuthQueries'
import { toast } from 'react-hot-toast'

type FormValues = {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { register, handleSubmit, formState } = useForm<FormValues>({ mode: 'onBlur' })
  const login = useLogin()

  const onSubmit = async (data: FormValues) => {
    try {
      await login.mutateAsync(data)
      toast.success('Logged in successfully')
      router.push('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      toast.error(msg)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sign in to CureVo</h1>
      <p className="text-sm text-gray-600 mt-2">Enter your account details to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email', { required: 'Email is required' })}
          error={formState.errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          {...register('password', { required: 'Password is required' })}
          error={formState.errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm">
            <input type="checkbox" className="mr-2" /> Remember me
          </label>
          <a className="text-sm text-indigo-600 hover:underline" href="#">Forgot?</a>
        </div>

        <div>
          <Button type="submit" disabled={login.isLoading} className="w-full">
            {login.isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <FormError message={String(login.error?.message ?? null)} />
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600">
        New to CureVo? <a href="/register" className="text-indigo-600 hover:underline">Create an account</a>
      </p>
    </div>
  )
}
