'use client'

import { loginSchema, registrationSchema } from '@happi/validation'
import type { LoginInput, RegistrationInput } from '@happi/validation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  AuthField,
  AuthFormMessage,
  AuthSubmitButton,
} from '@/components/auth-form-card'
import { authService, getApiErrorMessage } from '@/services/auth.service'
import { withNextParam } from '@/utils/auth-next'

type AccountField = keyof LoginInput | keyof RegistrationInput
type AccountErrors = Partial<Record<AccountField, string>>

interface AccountPanelProps {
  mode: 'login' | 'register'
  emailVerified?: boolean
  nextPath?: string
  passwordReset?: boolean
}

function destinationForRole(role: 'client' | 'therapist' | 'admin') {
  return role === 'therapist' ? '/professionals' : '/'
}

function canUseNextPath(
  nextPath: string | undefined,
  role: 'client' | 'therapist' | 'admin',
) {
  if (!nextPath?.startsWith('/professionals')) return true

  return role === 'therapist' || role === 'admin'
}

export function AccountPanel({
  mode,
  emailVerified = false,
  nextPath,
  passwordReset = false,
}: AccountPanelProps) {
  const isLogin = mode === 'login'
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<AccountErrors>({})
  const [requestError, setRequestError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tab =
    'p-[.58rem] text-center text-[.85rem] text-[#566458] no-underline'
  const selected =
    '-m-0.5 rounded-[.55rem] border-2 border-[#195438] bg-[#fffdf8] text-[#112f22]'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFieldErrors({})
    setRequestError(undefined)

    const formData = new FormData(event.currentTarget)

    if (isLogin) {
      const result = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
      })

      if (!result.success) {
        const errors: AccountErrors = {}

        for (const issue of result.error.issues) {
          const field = issue.path[0]
          if ((field === 'email' || field === 'password') && !(field in errors)) {
            errors[field] = issue.message
          }
        }

        setFieldErrors(errors)
        return
      }

      setIsSubmitting(true)

      try {
        await authService.login(result.data)
        const user = await authService.getCurrentUser()
        router.replace(
          canUseNextPath(nextPath, user.role)
            ? (nextPath ?? destinationForRole(user.role))
            : destinationForRole(user.role),
        )
        router.refresh()
      } catch (error) {
        setRequestError(getApiErrorMessage(error))
      } finally {
        setIsSubmitting(false)
      }

      return
    }

    const result = registrationSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    })

    if (!result.success) {
      const errors: AccountErrors = {}

      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !(field in errors)) {
          errors[field as AccountField] = issue.message
        }
      }

      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authService.register(result.data)

      if (response.devVerificationOtp) {
        sessionStorage.setItem(
          'happi:dev-verification-otp',
          response.devVerificationOtp,
        )
        sessionStorage.setItem(
          'happi:dev-verification-email',
          result.data.email,
        )
      }

      router.push(
        withNextParam(
          `/auth/verify-email?email=${encodeURIComponent(result.data.email)}`,
          nextPath,
        ),
      )
    } catch (error) {
      setRequestError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-[1.8rem] rounded-[.65rem] border border-[#e1d9cc] bg-[#fffdf8] p-6 text-left">
      <nav
        className="-mx-6 mt-10 md:-mt-14 mb-[1.3rem] grid grid-cols-2 overflow-hidden rounded-[.55rem] bg-[#f0ede3]"
        aria-label="Account access"
      >
        <Link
          className={`${tab} ${isLogin ? selected : ''}`}
          href={withNextParam('/auth/login', nextPath)}
          aria-current={isLogin ? 'page' : undefined}
        >
          Sign in
        </Link>
        <Link
          className={`${tab} ${!isLogin ? selected : ''}`}
          href={withNextParam('/auth/register', nextPath)}
          aria-current={!isLogin ? 'page' : undefined}
        >
          Create account
        </Link>
      </nav>

      <form className="grid gap-[1.1rem]" onSubmit={handleSubmit} noValidate>
        {isLogin && emailVerified && (
          <AuthFormMessage tone="success">
            Email verified. You can now sign in.
          </AuthFormMessage>
        )}
        {isLogin && passwordReset && (
          <AuthFormMessage tone="success">
            Password updated. You can now sign in.
          </AuthFormMessage>
        )}
        {!isLogin && (
          <>
            <div className="grid grid-cols-1 gap-[1.1rem] sm:grid-cols-2">
              <AuthField
                label="First name"
                name="firstName"
                autoComplete="given-name"
                error={fieldErrors.firstName}
              />
              <AuthField
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                error={fieldErrors.lastName}
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="text-[.85rem]">Role</legend>
              <div className="grid gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-[.82rem] text-[#566458]">
                  <input
                    className="h-4 w-4 accent-[#195438]"
                    type="radio"
                    name="role"
                    value="client"
                    defaultChecked
                  />
                  <span>User</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[.82rem] text-[#566458]">
                  <input
                    className="h-4 w-4 accent-[#195438]"
                    type="radio"
                    name="role"
                    value="therapist"
                  />
                  <span>Professional</span>
                </label>
              </div>
              {fieldErrors.role && (
                <span className="text-xs text-[#9b3f29]">
                  {fieldErrors.role}
                </span>
              )}
            </fieldset>
          </>
        )}

        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          minLength={isLogin ? 1 : 8}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          error={fieldErrors.password}
        />
        {requestError && (
          <AuthFormMessage tone="error">{requestError}</AuthFormMessage>
        )}
        <AuthSubmitButton
          type="submit"
          loading={isSubmitting}
        >
          {isLogin ? 'Sign in' : 'Create account'}
        </AuthSubmitButton>
      </form>

      {isLogin ? (
        <Link
          className="mt-6 block text-center text-[.85rem] text-[#195438] no-underline"
          href="/auth/forgot-password"
        >
          Forgot password?
        </Link>
      ) : (
        <p className="mt-4 mb-0 text-xs text-[#657167]">
          By continuing, you agree to Happi&apos;s privacy and care terms.
        </p>
      )}
    </section>
  )
}
