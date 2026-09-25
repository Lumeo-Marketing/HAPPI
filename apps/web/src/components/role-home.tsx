'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { SiteHeader } from '@/components/site-header'
import { authService } from '@/services/auth.service'

function DashboardCard({ title, copy, href }: { title: string; copy: string; href: string }) {
  return <Link className="rounded-[.65rem] border border-[#e1d9cc] bg-[#fffdf8] p-5 no-underline transition-colors hover:border-[#195438]" href={href}>
    <h2 className="m-0 font-[family-name:var(--happi-font-title)] text-lg text-[#112f22]">{title}</h2>
    <p className="mt-2 mb-0 text-sm leading-6 text-[#566458]">{copy}</p>
    <span className="mt-5 block text-sm font-semibold text-[#195438]">Open -&gt;</span>
  </Link>
}

function Dashboard({ role }: { role: 'client' | 'therapist' | 'admin' }) {
  const isTherapist = role === 'therapist'
  return <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]"><SiteHeader active="dashboard" /><section className="mx-auto w-[min(1240px,calc(100%_-_2.5rem))] py-10 max-md:w-[calc(100%_-_2rem)]"><p className="mb-1 text-[.84rem] text-[#e5763d]">Your Happi dashboard</p><h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[2.1rem]">{isTherapist ? 'Your professional workspace' : 'Your care dashboard'}</h1><p className="mt-2 max-w-2xl text-[.9rem] leading-6 text-[#566458]">{isTherapist ? 'Manage your professional profile, availability and sessions from one place.' : 'Find support, manage your bookings and keep your care journey in one place.'}</p><div className="mt-8 grid gap-4 md:grid-cols-3">{isTherapist ? <><DashboardCard title="Profile management" copy="Complete and maintain the professional profile clients see." href="/professionals" /><DashboardCard title="Availability" copy="Set the times when clients can request sessions." href="/professionals/availability" /><DashboardCard title="Bookings & earnings" copy="Review booking requests and confirmed sessions." href="/professionals/bookings" /></> : <><DashboardCard title="Find a therapist" copy="Browse verified professionals and compare care options." href="/therapists" /><DashboardCard title="Upcoming care" copy="Your confirmed sessions and booking requests will appear here." href="/care" /><DashboardCard title="My care" copy="Keep your therapists, sessions and care details together." href="/care" /></>}</div></section></main>
}

export function RoleHome({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'client' | 'therapist' | 'admin'>()
  const [checked, setChecked] = useState(false)
  useEffect(() => { authService.getCurrentUser().then((user) => setRole(user?.role)).catch(() => undefined).finally(() => setChecked(true)) }, [])
  if (!checked) return <div className="min-h-screen bg-[#fbf7ee]" />
  return role ? <Dashboard role={role} /> : <>{children}</>
}
