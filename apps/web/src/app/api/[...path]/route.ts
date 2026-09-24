import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ProxyContext {
  params: Promise<{ path: string[] }>
}

const requestHeadersToRemove = [
  'connection',
  'content-length',
  'host',
  'transfer-encoding',
]
const responseHeadersToRemove = [
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
]
const accessTokenCookie = 'happi_access_token'
const refreshTokenCookie = 'happi_refresh_token'
const refreshTokenMaxAge = 30 * 24 * 60 * 60

interface TokenResponseBody {
  statusCode: number
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: Record<string, unknown>
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

function missingSessionResponse() {
  return NextResponse.json(
    { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
    { status: 401 },
  )
}

function clearedSessionResponse() {
  const response = NextResponse.json({ statusCode: 200, message: 'Logged out' })
  response.cookies.delete(accessTokenCookie)
  response.cookies.delete(refreshTokenCookie)
  return response
}

function getApiBaseUrl(): URL {
  const value = process.env.API_INTERNAL_URL ?? 'http://localhost:4000/api/v1'
  const url = new URL(value)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('API_INTERNAL_URL must use HTTP or HTTPS')
  }

  url.pathname = `${url.pathname.replace(/\/$/, '')}/`
  return url
}

async function proxyRequest(request: NextRequest, context: ProxyContext) {
  try {
    const { path } = await context.params
    const routePath = path.join('/')
    const isLogin = routePath === 'auth/login'
    const isRefresh = routePath === 'auth/refresh'
    const isLogout = routePath === 'auth/logout'
    const isCurrentUser = routePath === 'auth/me'
    const upstreamUrl = new URL(
      path.map(encodeURIComponent).join('/'),
      getApiBaseUrl(),
    )
    upstreamUrl.search = request.nextUrl.search

    const requestHeaders = new Headers(request.headers)
    requestHeadersToRemove.forEach((header) => requestHeaders.delete(header))
    requestHeaders.set('x-forwarded-host', request.nextUrl.host)
    requestHeaders.set('x-forwarded-proto', request.nextUrl.protocol.slice(0, -1))

    const hasBody = !['GET', 'HEAD'].includes(request.method)
    let requestBody: ArrayBuffer | string | undefined = hasBody
      ? await request.arrayBuffer()
      : undefined

    if (isRefresh || isLogout) {
      const refreshToken = request.cookies.get(refreshTokenCookie)?.value
      if (!refreshToken) {
        return isLogout ? clearedSessionResponse() : missingSessionResponse()
      }

      requestHeaders.set('content-type', 'application/json')
      requestBody = JSON.stringify({ refreshToken })
    }

    if (isCurrentUser) {
      const accessToken = request.cookies.get(accessTokenCookie)?.value
      if (!accessToken) return missingSessionResponse()

      requestHeaders.set('authorization', `Bearer ${accessToken}`)
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: requestHeaders,
      body: requestBody,
      cache: 'no-store',
      redirect: 'follow',
    })

    if ((isLogin || isRefresh) && upstreamResponse.ok) {
      const body = (await upstreamResponse.json()) as TokenResponseBody
      const response = NextResponse.json(
        { statusCode: body.statusCode, user: body.user },
        { status: upstreamResponse.status },
      )

      response.cookies.set(
        accessTokenCookie,
        body.accessToken,
        sessionCookieOptions(body.expiresIn),
      )
      response.cookies.set(
        refreshTokenCookie,
        body.refreshToken,
        sessionCookieOptions(refreshTokenMaxAge),
      )
      return response
    }

    if (isLogout) {
      const body = await upstreamResponse.json()
      const response = NextResponse.json(body, { status: upstreamResponse.status })
      response.cookies.delete(accessTokenCookie)
      response.cookies.delete(refreshTokenCookie)
      return response
    }

    const responseHeaders = new Headers(upstreamResponse.headers)
    responseHeadersToRemove.forEach((header) =>
      responseHeaders.delete(header),
    )

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    })
  } catch {
    return Response.json(
      {
        statusCode: 502,
        message: 'The API is temporarily unavailable.',
        error: 'Bad Gateway',
      },
      { status: 502 },
    )
  }
}

export {
  proxyRequest as DELETE,
  proxyRequest as GET,
  proxyRequest as HEAD,
  proxyRequest as OPTIONS,
  proxyRequest as PATCH,
  proxyRequest as POST,
  proxyRequest as PUT,
}
