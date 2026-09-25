import { describe, expect, it } from '@jest/globals'
import { ConfigService } from '@nestjs/config'

import { AuthEmailService } from './auth-email.service'

describe('development auth token fallback', () => {
  const defaults: Record<string, string> = {
    NODE_ENV: 'development',
    AUTH_DEV_RETURN_TOKENS: 'true',
    DATABASE_HOST: 'localhost',
    DATABASE_URL: '',
    RESEND_API_KEY: '',
    EMAIL_FROM: 'notifications@example.com',
  }

  function service(overrides: Record<string, string | undefined> = {}) {
    const values = { ...defaults, ...overrides }
    return new AuthEmailService({
      get: (key: string) => values[key],
    } as ConfigService)
  }

  it('allows only a loopback request to a local development database', () => {
    expect(service().canReturnDevelopmentToken('127.0.0.1')).toBe(true)
    expect(service().canReturnDevelopmentToken('::1')).toBe(true)
    expect(service().canReturnDevelopmentToken('::ffff:127.0.0.1')).toBe(true)
    expect(service().canReturnDevelopmentToken('192.168.1.2')).toBe(false)
  })

  it.each([
    { NODE_ENV: 'production' },
    { AUTH_DEV_RETURN_TOKENS: 'false' },
    { DATABASE_HOST: 'postgres.railway.internal' },
    { DATABASE_URL: 'postgres://hosted.example/db' },
    { RESEND_API_KEY: 're_configured', EMAIL_FROM: 'auth@happi.test' },
  ])('does not return tokens outside the fallback configuration', (overrides) => {
    expect(service(overrides).canReturnDevelopmentToken('127.0.0.1')).toBe(false)
  })
})
