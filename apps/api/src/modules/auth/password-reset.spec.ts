import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { DataSource, Repository } from 'typeorm'

import { AuthEmailService } from './auth-email.service'
import { AuthService } from './auth.service'
import { AuthAuditLog } from './entities/auth-audit-log.entity'
import { AuthSession } from './entities/auth-session.entity'
import { UserRole, UserStatus } from './entities/auth.enums'
import { EmailVerificationToken } from './entities/email-verification-token.entity'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { User } from './entities/user.entity'
import { PasswordHasherService } from './password-hasher.service'
import { TokenService } from './token.service'

function setup(devToken = false) {
  const user = {
    id: randomUUID(),
    email: 'ada@example.com',
    passwordHash: 'old-password-hash',
    emailVerifiedAt: new Date(),
    status: UserStatus.ACTIVE,
    role: UserRole.CLIENT,
  } as User
  const session = { userId: user.id, revokedAt: null } as AuthSession
  let resetToken: PasswordResetToken | null = null
  let deliveredToken: string | null = null
  const passwordHasher = new PasswordHasherService()

  const users = {
    findOneBy: async ({ email }: { email: string }) =>
      email === user.email ? user : null,
    update: async (_id: string, values: Partial<User>) => {
      Object.assign(user, values)
      return { affected: 1 }
    },
  }
  const resetTokens = {
    create: (value: PasswordResetToken) => value,
    save: async (value: PasswordResetToken) => {
      resetToken = { ...value, id: randomUUID(), usedAt: null }
      return resetToken
    },
    findOneBy: async ({ tokenHash }: { tokenHash: string }) =>
      resetToken?.tokenHash === tokenHash && !resetToken.usedAt
        ? resetToken
        : null,
    update: async (criteria: Partial<PasswordResetToken>, values: Partial<PasswordResetToken>) => {
      if (!resetToken || (criteria.id && criteria.id !== resetToken.id) || resetToken.usedAt) {
        return { affected: 0 }
      }
      Object.assign(resetToken, values)
      return { affected: 1 }
    },
  }
  const sessions = {
    update: async (_criteria: unknown, values: Partial<AuthSession>) => {
      Object.assign(session, values)
      return { affected: 1 }
    },
  }
  const audit = {
    create: (value: AuthAuditLog) => value,
    save: async (value: AuthAuditLog) => value,
  }
  const email = {
    assertConfigured: () => {},
    canReturnDevelopmentToken: () => devToken,
    sendPasswordResetEmail: async (_address: string, token: string) => {
      deliveredToken = token
    },
  }
  const manager = {
    getRepository: (entity: unknown) => {
      if (entity === User) return users
      if (entity === PasswordResetToken) return resetTokens
      if (entity === AuthSession) return sessions
      if (entity === AuthAuditLog) return audit
      throw new Error('Unexpected repository')
    },
  }
  const dataSource = {
    transaction: async (work: (manager: unknown) => Promise<unknown>) =>
      work(manager),
  }

  const service = new AuthService(
    users as unknown as Repository<User>,
    {} as Repository<EmailVerificationToken>,
    audit as unknown as Repository<AuthAuditLog>,
    sessions as unknown as Repository<AuthSession>,
    resetTokens as unknown as Repository<PasswordResetToken>,
    passwordHasher,
    email as AuthEmailService,
    {} as TokenService,
    dataSource as DataSource,
  )

  return {
    service,
    user,
    session,
    getDeliveredToken: () => deliveredToken,
    getResetToken: () => resetToken,
  }
}

describe('password reset', () => {
  it('returns the token only in the local development fallback', async () => {
    const { service, user, getDeliveredToken, getResetToken } = setup(true)
    const response = await service.requestPasswordReset({ email: user.email }, '127.0.0.1')

    expect(response).toHaveProperty('devPasswordResetOtp')
    expect(getDeliveredToken()).toBeNull()
    expect(getResetToken()?.tokenHash).not.toBe(response.devPasswordResetOtp)
    await service.confirmPasswordReset({
      email: user.email,
      otp: response.devPasswordResetOtp!,
      newPassword: 'a-new-secure-password',
    })
    expect(await new PasswordHasherService().verify('a-new-secure-password', user.passwordHash)).toBe(true)
  })

  it('returns the same response for known and unknown emails', async () => {
    const { service, getDeliveredToken, getResetToken } = setup()

    const unknown = await service.requestPasswordReset({
      email: 'nobody@example.com',
    })
    expect(getDeliveredToken()).toBeNull()

    const known = await service.requestPasswordReset({
      email: 'ada@example.com',
    })
    expect(known).toEqual(unknown)
    expect(getDeliveredToken()).toBeTruthy()
    expect(getResetToken()?.tokenHash).not.toBe(getDeliveredToken())
  })

  it('changes the password once and revokes the active session', async () => {
    const { service, user, session, getDeliveredToken } = setup()
    await service.requestPasswordReset({ email: user.email })
    const token = getDeliveredToken()!

    await service.confirmPasswordReset({
      email: user.email,
      otp: token,
      newPassword: 'a-new-secure-password',
    })

    expect(await new PasswordHasherService().verify('a-new-secure-password', user.passwordHash)).toBe(true)
    expect(session.revokedAt).toBeInstanceOf(Date)
    await expect(
      service.confirmPasswordReset({ email: user.email, otp: token, newPassword: 'another-password' }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('rejects expired links', async () => {
    const { service, user, getDeliveredToken, getResetToken } = setup()
    await service.requestPasswordReset({ email: user.email })
    getResetToken()!.expiresAt = new Date(Date.now() - 1)

    await expect(
      service.confirmPasswordReset({
        email: user.email,
        otp: getDeliveredToken()!,
        newPassword: 'a-new-secure-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})
