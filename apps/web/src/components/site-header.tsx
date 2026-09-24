'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SessionControls } from '@/components/session-controls'
import { authService } from '@/services/auth.service'

export function SiteHeader({ active, authPage = false }: { active?: 'therapists' | 'therapists-portal'; authPage?: boolean }) {
  const [isClient, setIsClient] = useState(false)
  const navLink = 'text-[.88rem] text-[#566458] no-underline'
  const activeLink = 'font-semibold text-[#195438]'

  useEffect(() => {
    authService.getCurrentUser().then((user) => setIsClient(user?.role === 'client')).catch(() => setIsClient(false))
  }, [])

  return <header className="flex h-[65px] items-center gap-4 border-b border-[#e8e0d2] bg-[#fbf8f0] px-[clamp(1.25rem,4.1vw,3.5rem)] md:gap-[2.2rem]">
    <Link className="font-[family-name:var(--happi-font-title)] text-[1.65rem] font-bold text-[#194e33] no-underline" href="/">Happi</Link>
    <nav className="hidden flex-1 justify-center gap-[1.65rem] md:flex" aria-label="Primary navigation">
      <Link className={`${navLink} ${active === 'therapists' ? activeLink : ''}`} href="/therapists">Find a therapist</Link>
      <Link className={navLink} href="/care">My care</Link>
      {!isClient && <Link className={`${navLink} ${active === 'therapists-portal' ? activeLink : ''}`} href="/professionals">For professionals</Link>}
    </nav>
    <div className="ml-auto flex items-center"><SessionControls forceSignIn={authPage} /></div>
  </header>
}
