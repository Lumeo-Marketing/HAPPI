'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SessionControls } from '@/components/session-controls'
import { authService } from '@/services/auth.service'

export function SiteHeader({ active, authPage = false }: { active?: 'dashboard' | 'therapists' | 'care' | 'professionals' | 'therapists-portal' | 'availability' | 'bookings'; authPage?: boolean }) {
  const [userRole, setUserRole] = useState<'client' | 'therapist' | 'admin'>()
  const navLink = 'text-[.88rem] text-[#566458] no-underline'
  const activeLink = 'font-semibold text-[#195438]'

  useEffect(() => {
    authService.getCurrentUser().then((user) => setUserRole(user?.role)).catch(() => setUserRole(undefined))
  }, [])

  return <header className="flex h-[65px] items-center gap-4 border-b border-[#e8e0d2] bg-[#fbf8f0] px-[clamp(1.25rem,4.1vw,3.5rem)] md:gap-[2.2rem]">
    <Link className="font-[family-name:var(--happi-font-title)] text-[1.65rem] font-bold text-[#194e33] no-underline" href="/">Happi</Link>
    <nav className="hidden flex-1 justify-center gap-[1.65rem] md:flex" aria-label="Primary navigation">
      {userRole && <Link className={`${navLink} ${active === 'dashboard' ? activeLink : ''}`} href="/">Dashboard</Link>}
      {userRole !== 'therapist' && <>
        <Link className={`${navLink} ${active === 'therapists' ? activeLink : ''}`} href="/therapists">Find a therapist</Link>
        <Link className={`${navLink} ${active === 'care' ? activeLink : ''}`} href="/care">My care</Link>
      </>}
      {userRole === 'therapist' && <>
        <Link className={`${navLink} ${active === 'professionals' || active === 'therapists-portal' ? activeLink : ''}`} href="/professionals">Profile management</Link>
        <Link className={`${navLink} ${active === 'availability' ? activeLink : ''}`} href="/professionals/availability">Availability</Link>
        <Link className={`${navLink} ${active === 'bookings' ? activeLink : ''}`} href="/professionals/bookings">Bookings &amp; earnings</Link>
      </>}
      {!userRole && <Link className={`${navLink} ${active === 'professionals' ? activeLink : ''}`} href="/professionals">For professionals</Link>}
    </nav>
    <div className="ml-auto flex items-center"><SessionControls forceSignIn={authPage} /></div>
  </header>
}
