import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/site-header'

interface AuthPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[#fbf7ee] text-[#112f22]">
      <SiteHeader authPage />
      <section className="mx-auto w-[min(28rem,calc(100%_-_2.5rem))] py-10 sm:py-14">
        <p className="mb-1 text-[.84rem] text-[#e5763d]">{eyebrow}</p>
        <h1 className="m-0 font-[family-name:var(--happi-font-title)] text-[2rem] leading-tight">
          {title}
        </h1>
        <p className="mt-2 mb-0 text-[.87rem] leading-6 text-[#566458]">
          {description}
        </p>
        {children}
      </section>
    </main>
  )
}
