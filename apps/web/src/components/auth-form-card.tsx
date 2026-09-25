'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface AuthFormCardProps {
  children: ReactNode
}

interface AuthFieldProps {
  label: string
  name: string
  type?: 'email' | 'password' | 'text'
  autoComplete?: string
  inputMode?: 'email' | 'numeric' | 'text'
  maxLength?: number
  minLength?: number
  placeholder?: string
  required?: boolean
  error?: string
  defaultValue?: string
}

interface AuthSubmitButtonProps {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
}

interface AuthFormMessageProps {
  children: ReactNode
  tone: 'error' | 'success'
}

export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <section className="mt-7 rounded-[.65rem] border border-[#e1d9cc] bg-[#fffdf8] p-6">
      {children}
    </section>
  )
}

export function AuthField({
  label,
  name,
  type = 'text',
  autoComplete,
  inputMode,
  maxLength,
  minLength,
  placeholder,
  required = true,
  error,
  defaultValue,
}: AuthFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && passwordVisible ? 'text' : type

  return (
    <label className="grid gap-1.5 text-[.85rem] text-[#112f22]" htmlFor={name}>
      {label}
      <span className="relative grid">
        <input
          className={`min-h-[2.3rem] rounded-[.4rem] border bg-[#fffdf8] px-3 py-2 text-[#112f22] shadow-[0_2px_3px_#382c1d12] outline-none focus:ring-1 ${
            error
              ? 'border-[#b75b43] focus:border-[#b75b43] focus:ring-1 focus:ring-[#b75b43]'
              : 'border-[#e1d9cc] focus:border-[#195438] focus:ring-1 focus:ring-[#195438]'
          } ${isPassword ? 'pr-14' : ''}`}
          id={name}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {isPassword && (
          <button
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-lg text-[#195438]"
            type="button"
            aria-label={passwordVisible ? `Hide ${label}` : `Show ${label}`}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        )}
      </span>
      {error && (
        <span className="text-xs text-[#9b3f29]" id={`${name}-error`}>
          {error}
        </span>
      )}
    </label>
  )
}

export function AuthSubmitButton({
  children,
  disabled = false,
  loading = false,
  type = 'button',
}: AuthSubmitButtonProps) {
  return (
    <button
      className="w-full rounded-[.4rem] border border-[#195438] bg-[#195438] px-4 py-2.5 text-[.88rem] font-bold text-[#fffdf8] shadow-sm disabled:cursor-not-allowed disabled:border-[#9aaa9f] disabled:bg-[#9aaa9f]"
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export function AuthFormMessage({ children, tone }: AuthFormMessageProps) {
  return (
    <p
      className={`m-0 text-[.82rem] ${
        tone === 'success'
          ? 'text-[#195438]'
          : 'text-[#9b3f29]'
      }`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
