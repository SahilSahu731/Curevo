'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Input from '@/components/common/Input'
import PasswordInput from '@/components/common/PasswordInput'
import Button from '@/components/common/Button'
import FormError from '@/components/common/FormError'
import { useRegister } from '@/hooks/queries/useAuthQueries'
import { toast } from 'react-hot-toast'

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'doctor'
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState } = useForm<FormValues>({ mode: 'onBlur' })
  const registerMutation = useRegister()

  const password = watch('password')

  const onSubmit = async (data: FormValues) => {
    try {
      // Backend register expects FormData (authService.register signature)
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('email', data.email)
      fd.append('password', data.password)
      fd.append('role', data.role)

      await registerMutation.mutateAsync(fd)
      toast.success('Account created and logged in')
      router.push('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed'
      toast.error(msg)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Create your CureVo account</h1>
      <p className="text-sm text-gray-600 mt-2">Register as patient or doctor and start booking appointments.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Full name" placeholder="John Doe" {...register('name', { required: 'Name is required' })} error={formState.errors.name?.message} />

        <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} error={formState.errors.email?.message} />

        <PasswordInput label="Password" placeholder="Create a password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} error={formState.errors.password?.message} />

        <PasswordInput label="Confirm Password" placeholder="Repeat password" {...register('confirmPassword', { required: 'Please confirm password', validate: (val) => val === password || 'Passwords do not match' })} error={formState.errors.confirmPassword?.message} />

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <div className="mt-2 flex gap-4">
            <label className="inline-flex items-center">
              <input type="radio" value="patient" defaultChecked {...register('role')} className="mr-2" /> Patient
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="doctor" {...register('role')} className="mr-2" /> Doctor
            </label>
          </div>
        </div>

        <div>
          <Button type="submit" disabled={registerMutation.isLoading} className="w-full">
            {registerMutation.isLoading ? 'Creating account...' : 'Create account'}
          </Button>
          {/* <FormError message={String(registerMutation.error?.message ?? null)} /> */}
        </div>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Sign in</a>
      </p>
    </div>
  )
}
