'use client'

import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from '@happi/validation'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import {
  AuthField,
  AuthFormCard,
  AuthFormMessage,
  AuthSubmitButton,
} from '@/components/auth-form-card'
import { authService, getApiErrorMessage } from '@/services/auth.service'

interface ResetPasswordFormProps {
  initialToken?: string
  requestSent?: boolean
}

interface ResetErrors {
  token?: string
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

      if (response.devPasswordResetToken) {
        sessionStorage.setItem(
          'happi:dev-password-reset-token',
          response.devPasswordResetToken,
        )
      }

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
          Send reset token
        </AuthSubmitButton>
      </form>
    </AuthFormCard>
  )
}

export function ResetPasswordForm({
  initialToken = '',
  requestSent = false,
}: ResetPasswordFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [fieldErrors, setFieldErrors] = useState<ResetErrors>({})
  const [requestError, setRequestError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialToken) return

    const savedToken = sessionStorage.getItem('happi:dev-password-reset-token')
    const tokenInput = formRef.current?.elements.namedItem('token')

    if (savedToken && tokenInput instanceof HTMLInputElement) {
      tokenInput.value = savedToken
    }
  }, [initialToken])

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
      token: formData.get('token'),
      newPassword,
    })

    if (!result.success) {
      const errors: ResetErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'token' || field === 'newPassword') {
          errors[field] ??= issue.message
        }
      }

      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await authService.confirmPasswordReset(result.data)
      sessionStorage.removeItem('happi:dev-password-reset-token')
      router.push('/auth/login?reset=1')
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormCard>
      <form ref={formRef} className="grid gap-5" onSubmit={handleSubmit} noValidate>
        {requestSent && (
          <AuthFormMessage tone="success">
            If an eligible account exists, a password reset token has been sent.
          </AuthFormMessage>
        )}
        <AuthField
          label="Reset token"
          name="token"
          autoComplete="one-time-code"
          defaultValue={initialToken}
          error={fieldErrors.token}
        />
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
