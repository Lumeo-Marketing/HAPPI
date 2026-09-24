import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import { createHash } from 'node:crypto'

import { RedisService } from '../../infrastructure/redis/redis.service'

const incrementScript = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
  end
  return count
`

const limits = {
  register: { windowMs: 60 * 60_000, ip: 10, email: 3 },
  login: { windowMs: 15 * 60_000, ip: 30, email: 10 },
  verifyEmail: { windowMs: 15 * 60_000, ip: 20 },
  resendVerification: { windowMs: 60 * 60_000, ip: 10, email: 3 },
  refresh: { windowMs: 15 * 60_000, ip: 120 },
  passwordResetRequest: { windowMs: 60 * 60_000, ip: 10, email: 3 },
  passwordResetConfirm: { windowMs: 15 * 60_000, ip: 20 },
} as const

export type AuthRateLimitAction = keyof typeof limits

export interface AuthRateLimitRequest {
  ip?: string
  socket?: { remoteAddress?: string }
}

@Injectable()
export class AuthRateLimitService {
  constructor(private readonly redis: RedisService) {}

  async check(
    action: AuthRateLimitAction,
    request: AuthRateLimitRequest,
    email?: string,
  ): Promise<void> {
    const limit = limits[action]
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown'

    await this.consume(action, 'ip', ip, limit.ip, limit.windowMs)

    if (email && 'email' in limit) {
      await this.consume(
        action,
        'email',
        email.trim().toLowerCase(),
        limit.email,
        limit.windowMs,
      )
    }
  }

  private async consume(
    action: AuthRateLimitAction,
    scope: 'ip' | 'email',
    identity: string,
    maxAttempts: number,
    windowMs: number,
  ): Promise<void> {
    const identityHash = createHash('sha256').update(identity).digest('hex')
    const key = `happi:auth:rate:${action}:${scope}:${identityHash}`
    let timer: ReturnType<typeof setTimeout> | undefined
    let count: number

    try {
      const result = await Promise.race([
        this.redis.connect().then((client) =>
          client.eval(incrementScript, 1, key, windowMs),
        ),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error('Redis timeout')), 3000)
        }),
      ])
      count = Number(result)
    } catch {
      throw new ServiceUnavailableException('Authentication temporarily unavailable')
    } finally {
      if (timer) clearTimeout(timer)
    }

    if (!Number.isFinite(count)) {
      throw new ServiceUnavailableException('Authentication temporarily unavailable')
    }

    if (count > maxAttempts) {
      throw new HttpException(
        'Too many attempts. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }
  }
}
