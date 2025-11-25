import React from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'default' | 'ghost' | 'destructive' | 'outline'

type Size = 'sm' | 'md' | 'lg'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const base = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none'

const variantStyles: Record<Variant, string> = {
  default: 'bg-[var(--primary)] text-white',
  ghost: 'bg-transparent text-gray-300',
  destructive: 'bg-red-600 text-white',
  outline: 'bg-transparent border border-gray-700 text-white'
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export default function Button({ variant = 'default', size = 'md', loading = false, leftIcon, rightIcon, className = '', children, ...rest }: Props) {
  return (
    <button className={cn(base, variantStyles[variant], sizeStyles[size], className)} {...rest}>
      {loading ? (
        <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="mr-2 inline-flex">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  )
}
