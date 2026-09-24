import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'

export const accessTokenLifetimeSeconds = 15 * 60
export const refreshTokenLifetimeMs = 30 * 24 * 60 * 60 * 1000

@Injectable()
export class TokenService {
  constructor(private readonly config: ConfigService) {}

  createAccessToken(userId: string, sessionId: string): string {
    return jwt.sign(
      { sub: userId, sid: sessionId },
      this.config.getOrThrow<string>('JWT_SECRET'),
      {
        algorithm: 'HS256',
        issuer: 'happi-api',
        audience: 'happi-clients',
        expiresIn: accessTokenLifetimeSeconds,
      },
    )
  }

  verifyAccessToken(token: string): { sub: string; sid: string } {
    const payload = jwt.verify(token, this.config.getOrThrow<string>('JWT_SECRET'), {
      algorithms: ['HS256'],
      issuer: 'happi-api',
      audience: 'happi-clients',
    })

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string'
    ) {
      throw new Error('Invalid access token claims')
    }

    return { sub: payload.sub, sid: payload.sid }
  }

  createRefreshToken(sessionId: string): string {
    return `${sessionId}.${randomBytes(32).toString('base64url')}`
  }

  sessionIdFromRefreshToken(token: string): string | null {
    const [sessionId, secret, extra] = token.split('.')

    if (
      extra !== undefined ||
      !sessionId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId) ||
      !secret ||
      !/^[A-Za-z0-9_-]{43}$/.test(secret)
    ) {
      return null
    }

    return sessionId
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  matchesRefreshToken(token: string, storedHash: string): boolean {
    if (!/^[0-9a-f]{64}$/i.test(storedHash)) {
      return false
    }

    return timingSafeEqual(
      Buffer.from(this.hashRefreshToken(token), 'hex'),
      Buffer.from(storedHash, 'hex'),
    )
  }
}
