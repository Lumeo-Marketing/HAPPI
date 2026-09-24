import { describe, expect, it, jest } from '@jest/globals'
import { BadRequestException, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'node:crypto'
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

describe('email verification', () => {
  it('keeps an earlier link valid if a resend fails, then consumes it once', async () => {
    const user = {
      id: randomUUID(),
      email: 'ada@example.com',
      emailVerifiedAt: null,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    } as User
    const records: EmailVerificationToken[] = []
    let deliveredToken = ''
    let failDelivery = false
    const users = {
      findOneBy: async () => user,
      update: async (_criteria: unknown, values: Partial<User>) => {
        Object.assign(user, values)
        return { affected: 1 }
      },
    }
    const verificationTokens = {
      create: (value: EmailVerificationToken) => value,
      save: async (value: EmailVerificationToken) => {
        const record = { ...value, id: randomUUID(), usedAt: null }
        records.push(record)
        return record
      },
      findOneBy: async ({ tokenHash }: { tokenHash: string }) =>
        records.find(
          (record) => record.tokenHash === tokenHash && !record.usedAt,
        ) ?? null,
      update: async (
        criteria: Partial<EmailVerificationToken>,
        values: Partial<EmailVerificationToken>,
      ) => {
        const matching = records.filter(
          (record) =>
            !record.usedAt &&
            (criteria.id
              ? record.id === criteria.id
              : record.userId === criteria.userId),
        )
        matching.forEach((record) => Object.assign(record, values))
        return { affected: matching.length }
      },
    }
    const audit = {
      create: (value: AuthAuditLog) => value,
      save: async (value: AuthAuditLog) => value,
    }
    const email = {
      assertConfigured: () => {},
      canReturnDevelopmentToken: () => false,
      sendVerificationEmail: async (_address: string, token: string) => {
        if (failDelivery) throw new Error('Provider unavailable')
        deliveredToken = token
      },
    }
    const manager = {
      getRepository: (entity: unknown) => {
        if (entity === User) return users
        if (entity === EmailVerificationToken) return verificationTokens
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
      verificationTokens as unknown as Repository<EmailVerificationToken>,
      audit as unknown as Repository<AuthAuditLog>,
      {} as Repository<AuthSession>,
      {} as Repository<PasswordResetToken>,
      {} as PasswordHasherService,
      email as AuthEmailService,
      {} as TokenService,
      dataSource as DataSource,
    )

    await service.resendVerificationEmail({ email: user.email })
    const firstHash = createHash('sha256').update(deliveredToken).digest('hex')
    failDelivery = true
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {})

    try {
      await service.resendVerificationEmail({ email: user.email })
    } finally {
      log.mockRestore()
    }

    expect(
      records.find((record) => record.tokenHash === firstHash)?.usedAt,
    ).toBeNull()
    await service.verifyEmail({ email: user.email, otp: deliveredToken })
    expect(user.emailVerifiedAt).toBeInstanceOf(Date)
    expect(records.every((record) => record.usedAt instanceof Date)).toBe(true)
    await expect(
      service.verifyEmail({ email: user.email, otp: deliveredToken }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})
