import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold'
  const styles = variant === 'primary' ? 'text-white' : 'bg-transparent text-gray-300'

  const style: React.CSSProperties = variant === 'primary' ? { background: 'var(--primary)', border: 'none' } : {}

  return (
    <button style={style} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}
