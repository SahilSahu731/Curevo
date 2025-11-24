import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | boolean
}

export default function Input({ label, error, ...rest }: Props) {
  return (
    <label className="block">
      {label && <span className="text-sm font-medium text-gray-200">{label}</span>}
      <input
        className={`mt-1 block w-full rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 border-transparent placeholder:opacity-60 ${error ? 'ring-2 ring-red-500' : ''}`}
        style={{ background: 'var(--panel-bg)', color: 'var(--foreground)', borderColor: 'transparent' }}
        {...rest}
      />
      {error && typeof error === 'string' && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </label>
  )
}
