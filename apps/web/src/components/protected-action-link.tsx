'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

import { authService } from '@/services/auth.service'

interface ProtectedActionLinkProps extends ComponentProps<typeof Link> {
  actionHref: string
}

export function ProtectedActionLink({
  actionHref,
  href,
  onClick,
  ...props
}: ProtectedActionLinkProps) {
  const router = useRouter()

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    event.preventDefault()

    try {
      await authService.getCurrentUser()
      router.push(actionHref)
    } catch {
      router.push(`/auth/login?next=${encodeURIComponent(actionHref)}`)
    }
  }

  return <Link {...props} href={href} onClick={handleClick} />
}
