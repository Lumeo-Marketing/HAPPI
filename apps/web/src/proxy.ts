import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const accessTokenCookie = 'happi_access_token'
const refreshTokenCookie = 'happi_refresh_token'

async function validateSession(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? ''
  const sessionCheck = await fetch(new URL('/api/auth/me', request.url), {
    headers: { cookie },
    cache: 'no-store',
  })

  if (sessionCheck.ok) {
    const user = (await sessionCheck.json()) as { role?: string }
    return user.role === 'therapist' || user.role === 'admin'
      ? NextResponse.next()
      : undefined
  }

  const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  })

  if (!refreshResponse.ok) return undefined

  const refreshedSession = (await refreshResponse.clone().json()) as {
    user?: { role?: string }
  }
  if (
    refreshedSession.user?.role !== 'therapist' &&
    refreshedSession.user?.role !== 'admin'
  ) {
    return undefined
  }

  const response = NextResponse.next()
  for (const setCookie of refreshResponse.headers.getSetCookie()) {
    response.headers.append('set-cookie', setCookie)
  }
  return response
}

export async function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(accessTokenCookie) ||
    request.cookies.has(refreshTokenCookie)

  if (hasSession) return (await validateSession(request)) ?? redirectToLogin(request)

  return redirectToLogin(request)
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/care/:path*', '/professionals/:path*'],
}
