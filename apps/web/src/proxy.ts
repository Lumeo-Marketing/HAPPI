import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const accessTokenCookie = 'happi_access_token'
const refreshTokenCookie = 'happi_refresh_token'

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(accessTokenCookie) ||
    request.cookies.has(refreshTokenCookie)

  if (hasSession) return NextResponse.next()

  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/care/:path*'],
}
