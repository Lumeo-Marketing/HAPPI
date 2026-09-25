export function getSafeNextPath(value: string | string[] | undefined) {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  if (value.startsWith('/auth/')) return undefined

  return value
}

export function withNextParam(path: string, nextPath?: string) {
  if (!nextPath) return path

  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}next=${encodeURIComponent(nextPath)}`
}
