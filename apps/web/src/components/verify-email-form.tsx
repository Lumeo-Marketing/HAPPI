'use client'

import {
  emailVerificationSchema,
  resendEmailVerificationSchema,
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

interface VerifyEmailFormProps {
  initialEmail?: string
  nextPath?: string
}

interface VerificationErrors {
  email?: string
  otp?: string
}

export function VerifyEmailForm({
  initialEmail = '',
  nextPath,
}: VerifyEmailFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [fieldErrors, setFieldErrors] = useState<VerificationErrors>({})
  const [requestError, setRequestError] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('happi:dev-verification-email')
    const savedOtp = sessionStorage.getItem('happi:dev-verification-otp')

    if (savedOtp && savedEmail === initialEmail) {
      setOtp(savedOtp)
    }
  }, [initialEmail])

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setRequestError(undefined)
    setSuccessMessage(undefined)

    const formData = new FormData(event.currentTarget)
    const result = emailVerificationSchema.safeParse({
      email: formData.get('email'),
      otp,
    })

    if (!result.success) {
      const errors: VerificationErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'email' || field === 'otp') {
          errors[field] ??= issue.message
        }
      }

      setFieldErrors(errors)
      return
    }

    setIsVerifying(true)

    try {
      const response = await authService.verifyEmail(result.data)
      sessionStorage.removeItem('happi:dev-verification-email')
      sessionStorage.removeItem('happi:dev-verification-otp')
      setSuccessMessage(response.message)
      const nextQuery = nextPath ? `&next=${encodeURIComponent(nextPath)}` : ''
      router.push(`/auth/login?verified=1${nextQuery}`)
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    const form = formRef.current
    if (!form) return

    setFieldErrors({})
    setRequestError(undefined)
    setSuccessMessage(undefined)

    const formData = new FormData(form)
    const result = resendEmailVerificationSchema.safeParse({
      email: formData.get('email'),
    })

    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0]?.message })
      return
    }

    setIsResending(true)

    try {
      const response = await authService.resendVerificationEmail(result.data)

      if (response.devVerificationOtp) {
        sessionStorage.setItem(
          'happi:dev-verification-email',
          result.data.email,
        )
        sessionStorage.setItem(
          'happi:dev-verification-otp',
          response.devVerificationOtp,
        )
        setOtp(response.devVerificationOtp)
      }

      setSuccessMessage(response.message)
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthFormCard>
      <form ref={formRef} className="grid gap-5" onSubmit={handleVerify} noValidate>
        <input type="hidden" name="email" value={initialEmail} readOnly />
        <label className="grid gap-2 text-[.85rem] text-[#112f22]">Verification code
          <InputOTP className="justify-center" maxLength={6} value={otp} onChange={setOtp} aria-label="Verification code" autoComplete="one-time-code">
            <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
          </InputOTP>
          {fieldErrors.otp && <span className="text-xs text-[#9b3f29]">{fieldErrors.otp}</span>}
        </label>

        {requestError && (
          <AuthFormMessage tone="error">{requestError}</AuthFormMessage>
        )}
        {successMessage && (
          <AuthFormMessage tone="success">{successMessage}</AuthFormMessage>
        )}

        <AuthSubmitButton
          type="submit"
          loading={isVerifying}
          disabled={isResending}
        >
          Verify email
        </AuthSubmitButton>
      </form>

      <p className="mt-6 mb-0 text-center text-[.85rem] text-[#566458]">
        Did not receive a code?{' '}
        <button
          className="font-medium text-[#195438] disabled:cursor-not-allowed disabled:text-[#849087]"
          type="button"
          disabled={isVerifying || isResending}
          aria-busy={isResending}
          onClick={handleResend}
        >
          {isResending ? 'Sending...' : 'Send another code'}
        </button>
      </p>
    </AuthFormCard>
  )
}
