import type { NextRequest } from 'next/server'

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
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'follow',
    })

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
      { message: 'The API is temporarily unavailable.' },
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
