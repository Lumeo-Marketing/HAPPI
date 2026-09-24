import { describe, expect, it, jest } from '@jest/globals'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'

import { AccessTokenGuard } from './access-token.guard'
import { AuthService } from './auth.service'
import { AuthAuditLog } from './entities/auth-audit-log.entity'
import { AuthSession } from './entities/auth-session.entity'
import { UserRole, UserStatus } from './entities/auth.enums'
import { EmailVerificationToken } from './entities/email-verification-token.entity'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { User } from './entities/user.entity'
import { PasswordHasherService } from './password-hasher.service'
import { TokenService } from './token.service'

describe('auth sessions', () => {
  const user = {
    id: '8b8fe4a8-1576-41f6-aad1-4eb3985d9855',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Okafor',
    passwordHash: 'stored-hash',
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
  } as User
  const config = {
    getOrThrow: () => 'a-real-test-secret-with-more-than-32-characters',
  } as unknown as ConfigService
  const tokens = new TokenService(config)

  function setup(verified = true) {
    const currentUser = { ...user, emailVerifiedAt: verified ? new Date() : null }
    let session: AuthSession | null = null
    const users = {
      findOneBy: jest.fn<() => Promise<User>>().mockResolvedValue(currentUser),
      update: jest.fn<() => Promise<{ affected: number }>>().mockResolvedValue({ affected: 1 }),
    }
    const sessions = {
      create: jest.fn((value: AuthSession) => value),
      save: jest.fn((value: AuthSession) => {
        session = value
        return Promise.resolve(value)
      }),
      findOneBy: jest.fn(() => Promise.resolve(session)),
      update: jest.fn((criteria: Partial<AuthSession>, values: Partial<AuthSession>) => {
        if (
          !session ||
          criteria.id !== session.id ||
          criteria.refreshTokenHash !== session.refreshTokenHash ||
          session.revokedAt
        ) {
          return Promise.resolve({ affected: 0 })
        }
        session = { ...session, ...values }
        return Promise.resolve({ affected: 1 })
      }),
    }
    const audit = {
      create: jest.fn((value: AuthAuditLog) => value),
      save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    }
    const passwords = {
      verify: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    }
    const service = new AuthService(
      users as unknown as Repository<User>,
      {} as Repository<EmailVerificationToken>,
      audit as unknown as Repository<AuthAuditLog>,
      sessions as unknown as Repository<AuthSession>,
      {} as Repository<PasswordResetToken>,
      passwords as unknown as PasswordHasherService,
      {} as ConstructorParameters<typeof AuthService>[6],
      tokens,
      {} as DataSource,
    )

    return { service, sessions, users, getSession: () => session }
  }

  it('blocks login before email verification', async () => {
    const { service, sessions } = setup(false)

    await expect(
      service.login({ email: user.email, password: 'correct-password' }),
    ).rejects.toThrow('Please verify your email before logging in')
    expect(sessions.save).not.toHaveBeenCalled()
  })

  it('rotates refresh tokens and rejects replay of the old token', async () => {
    const { service, getSession } = setup()
    const login = await service.login({
      email: user.email,
      password: 'correct-password',
    })

    expect(getSession()?.refreshTokenHash).toBe(
      tokens.hashRefreshToken(login.refreshToken),
    )
    expect(getSession()?.refreshTokenHash).not.toBe(login.refreshToken)

    const refreshed = await service.refresh({ refreshToken: login.refreshToken })
    expect(refreshed.refreshToken).not.toBe(login.refreshToken)
    await expect(
      service.refresh({ refreshToken: login.refreshToken }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('revokes the session on logout', async () => {
    const { service, getSession, sessions, users } = setup()
    const login = await service.login({
      email: user.email,
      password: 'correct-password',
    })
    await service.logout({ refreshToken: login.refreshToken })

    expect(getSession()?.revokedAt).toBeInstanceOf(Date)
    await expect(
      service.refresh({ refreshToken: login.refreshToken }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    const guard = new AccessTokenGuard(
      tokens,
      users as unknown as Repository<User>,
      sessions as unknown as Repository<AuthSession>,
    )
    const request = { headers: { authorization: `Bearer ${login.accessToken}` } }
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as Parameters<typeof guard.canActivate>[0]

    sessions.findOneBy.mockResolvedValueOnce(null)
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
