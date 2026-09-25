'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { AuthUser } from '@/services/auth.service'
import { authService } from '@/services/auth.service'

export function SessionControls({ forceSignIn = false }: { forceSignIn?: boolean }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser>()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)

  useEffect(() => {
    let active = true

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (forceSignIn) {
    return <Link className="rounded-md bg-[#174d33] px-4 py-[.62rem] text-[.85rem] font-semibold text-[#fffdf6] no-underline" href="/auth/login">Sign in</Link>
  }

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await authService.logout()
      setUser(undefined)
      sessionStorage.removeItem('happi:dev-verification-email')
      sessionStorage.removeItem('happi:dev-verification-otp')
      sessionStorage.removeItem('happi:dev-password-reset-token')
      setShowLogoutConfirmation(false)
      router.push('/auth/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <span className="w-[4.75rem] rounded-md bg-[#e7e4da] px-4 py-[.62rem] text-[.85rem] text-transparent">
        Sign in
      </span>
    )
  }

  if (!user) {
    return (
      <Link
        className="rounded-md bg-[#174d33] px-4 py-[.62rem] text-[.85rem] font-semibold text-[#fffdf6] no-underline"
        href="/auth/login"
      >
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 place-items-center rounded-full bg-[#195438] text-xs font-bold uppercase text-[#fffdf8]"
        title={`${user.firstName} ${user.lastName}`}
        aria-label={`${user.firstName} ${user.lastName}`}
      >
        {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`}
      </span>
      <button
        className="rounded-md border border-[#174d33] px-3 py-[.52rem] text-[.82rem] font-semibold text-[#174d33] disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled={isLoggingOut}
        onClick={() => setShowLogoutConfirmation(true)}
      >
        Sign out
      </button>
      {showLogoutConfirmation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#112f22]/35 px-5" role="presentation">
          <section className="w-full max-w-sm rounded-[.65rem] border border-[#e1d9cc] bg-[#fffdf8] p-6 text-[#112f22] shadow-xl" role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <h2 id="logout-title" className="m-0 font-[family-name:var(--happi-font-title)] text-xl">Sign out?</h2>
            <p className="mt-2 mb-5 text-sm text-[#566458]">Are you sure you want to sign out of your Happi account?</p>
            <div className="flex justify-end gap-2">
              <button className="rounded-md border border-[#e1d9cc] px-3 py-2 text-sm" type="button" onClick={() => setShowLogoutConfirmation(false)} disabled={isLoggingOut}>Cancel</button>
              <button className="rounded-md bg-[#195438] px-3 py-2 text-sm font-semibold text-[#fffdf8] disabled:opacity-60" type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? 'Signing out...' : 'Sign out'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
