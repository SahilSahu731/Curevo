import React, { useState } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | boolean
}

export default function PasswordInput({ label, error, ...rest }: Props) {
  const [show, setShow] = useState(false)

  return (
    <label className="block">
      {label && <span className="text-sm font-medium text-gray-200">{label}</span>}
      <div className="mt-1 relative">
        <input
          type={show ? 'text' : 'password'}
          className={`block w-full rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${error ? 'ring-2 ring-red-500' : ''}`}
          style={{ background: 'var(--panel-bg)', color: 'var(--foreground)', borderColor: 'transparent' }}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-300"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && typeof error === 'string' && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </label>
  )
}
