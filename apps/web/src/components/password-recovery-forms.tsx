'use client'

import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from '@happi/validation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import {
  AuthField,
  AuthFormCard,
  AuthFormMessage,
  AuthSubmitButton,
} from '@/components/auth-form-card'
import { authService, getApiErrorMessage } from '@/services/auth.service'

interface ResetPasswordFormProps {
  initialEmail?: string
  requestSent?: boolean
}

interface ResetErrors {
  otp?: string
  newPassword?: string
  confirmPassword?: string
}

export function ForgotPasswordForm() {
  const router = useRouter()
  const [emailError, setEmailError] = useState<string>()
  const [requestError, setRequestError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailError(undefined)
    setRequestError(undefined)

    const formData = new FormData(event.currentTarget)
    const result = passwordResetRequestSchema.safeParse({
      email: formData.get('email'),
    })

    if (!result.success) {
      setEmailError(result.error.issues[0]?.message)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authService.requestPasswordReset(result.data)

      if (response.devPasswordResetOtp) {
        sessionStorage.setItem(
          'happi:dev-password-reset-otp',
          response.devPasswordResetOtp,
        )
      }
      sessionStorage.setItem('happi:dev-password-reset-email', result.data.email)

      router.push('/auth/reset-password?requested=1')
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormCard>
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={emailError}
        />
        {requestError && (
          <AuthFormMessage tone="error">{requestError}</AuthFormMessage>
        )}
        <AuthSubmitButton type="submit" loading={isSubmitting}>
          Send reset code
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  )
}

export function ResetPasswordForm({
  initialEmail = '',
  requestSent = false,
}: ResetPasswordFormProps) {
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<ResetErrors>({})
  const [requestError, setRequestError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetOtp, setResetOtp] = useState('')
  const [resetEmail, setResetEmail] = useState(initialEmail)

  useEffect(() => {
    const savedOtp = sessionStorage.getItem('happi:dev-password-reset-otp')
    const savedEmail = sessionStorage.getItem('happi:dev-password-reset-email')
    if (savedOtp) setResetOtp(savedOtp)
    if (savedEmail) setResetEmail(savedEmail)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setRequestError(undefined)

    const formData = new FormData(event.currentTarget)
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    const result = passwordResetConfirmSchema.safeParse({
      email: resetEmail,
      otp: resetOtp,
      newPassword,
    })

    if (!result.success) {
      const errors: ResetErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'otp' || field === 'newPassword') {
          errors[field] ??= issue.message
        }
      }

      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await authService.confirmPasswordReset(result.data)
      sessionStorage.removeItem('happi:dev-password-reset-otp')
      sessionStorage.removeItem('happi:dev-password-reset-email')
      router.push('/auth/login?reset=1')
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormCard>
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {requestSent && (
          <AuthFormMessage tone="success">
            If an eligible account exists, a password reset code has been sent.
          </AuthFormMessage>
        )}
        <label className="grid gap-2 text-[.85rem] text-[#112f22]">Verification code
          <input className="min-h-[2.3rem] rounded-[.4rem] border border-[#e1d9cc] bg-[#fffdf8] px-3 py-2" value={resetOtp} onChange={(event) => setResetOtp(event.target.value)} inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
          {fieldErrors.otp && <span className="text-xs text-[#9b3f29]">{fieldErrors.otp}</span>}
        </label>
        <AuthField
          label="New password"
          name="newPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          error={fieldErrors.newPassword}
        />
        <AuthField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
        {requestError && (
          <AuthFormMessage tone="error">{requestError}</AuthFormMessage>
        )}
        <AuthSubmitButton type="submit" loading={isSubmitting}>
          Reset password
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  )
}
