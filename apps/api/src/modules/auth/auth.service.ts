import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto'
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm'
import { AuthEmailService } from './auth-email.service'
import type {
  EmailVerificationInput,
  LoginInput,
  PasswordResetConfirmInput,
  PasswordResetRequestInput,
  RefreshTokenInput,
  RegistrationInput,
  ResendEmailVerificationInput,
} from './auth.schemas'
import { AuthAuditEvent, UserRole, UserStatus } from './entities/auth.enums'
import { AuthAuditLog } from './entities/auth-audit-log.entity'
import { AuthSession } from './entities/auth-session.entity'
import { EmailVerificationToken } from './entities/email-verification-token.entity'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { User } from './entities/user.entity'
import { PasswordHasherService } from './password-hasher.service'
import {
  accessTokenLifetimeSeconds,
  refreshTokenLifetimeMs,
  TokenService,
} from './token.service'

const verificationTokenLifetimeMs = 10 * 60 * 1000
const passwordResetTokenLifetimeMs = 10 * 60 * 1000
const verificationEmailMessage =
  'If an unverified account exists for this email, a verification email has been sent.'
const passwordResetMessage =
  'If an account exists for this email, a password reset email has been sent.'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private readonly verificationTokens: Repository<EmailVerificationToken>,
    @InjectRepository(AuthAuditLog)
    private readonly auditLogs: Repository<AuthAuditLog>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokens: Repository<PasswordResetToken>,
    private readonly passwordHasher: PasswordHasherService,
    private readonly authEmail: AuthEmailService,
    private readonly tokens: TokenService,
    private readonly dataSource: DataSource,
  ) {}

  async register(input: RegistrationInput, remoteAddress?: string) {
    const returnDevToken = this.authEmail.canReturnDevelopmentToken(remoteAddress)
    if (!returnDevToken) this.authEmail.assertConfigured()
    const existingUser = await this.users.findOneBy({ email: input.email })

    if (existingUser) {
      throw new ConflictException('An account already exists for this email')
    }

    const user = await this.users.save(
      this.users.create({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash: await this.passwordHasher.hash(input.password),
        role: input.role as UserRole,
      }),
    )

    await this.writeAuditLog(user.id, AuthAuditEvent.REGISTRATION_COMPLETED)
    const token = await this.issueVerificationEmail(user, returnDevToken)

    return {
      message: 'Account created. Check your email to verify your account.',
      ...(token && { devVerificationOtp: token }),
    }
  }

  async verifyEmail({ email, otp }: EmailVerificationInput) {
    const user = await this.users.findOneBy({ email })
    if (!user) {
      throw new BadRequestException('This verification OTP is invalid or expired')
    }

    const tokenHash = this.hashToken(otp)
    const verificationToken = await this.verificationTokens.findOneBy({
      userId: user.id,
      tokenHash,
      usedAt: IsNull(),
    })

    if (!verificationToken || verificationToken.expiresAt <= new Date()) {
      throw new BadRequestException('This verification OTP is invalid or expired')
    }

    await this.dataSource.transaction(async (manager) => {
      const now = new Date()
      const claimed = await manager.getRepository(EmailVerificationToken).update(
        { id: verificationToken.id, usedAt: IsNull(), expiresAt: MoreThan(now) },
        { usedAt: now },
      )

      if (claimed.affected !== 1) {
        throw new BadRequestException('This verification OTP is invalid or expired')
      }

      await manager.getRepository(User).update(
        { id: verificationToken.userId },
        { emailVerifiedAt: now },
      )
      await manager.getRepository(EmailVerificationToken).update(
        { userId: verificationToken.userId, usedAt: IsNull() },
        { usedAt: now },
      )
      await manager.getRepository(AuthAuditLog).save(
        manager.getRepository(AuthAuditLog).create({
          userId: verificationToken.userId,
          event: AuthAuditEvent.EMAIL_VERIFIED,
        }),
      )
    })

    return { message: 'Email address verified. You can now log in.' }
  }

  async resendVerificationEmail({ email }: ResendEmailVerificationInput, remoteAddress?: string) {
    const returnDevToken = this.authEmail.canReturnDevelopmentToken(remoteAddress)
    if (!returnDevToken) this.authEmail.assertConfigured()
    const user = await this.users.findOneBy({ email })

    if (user && !user.emailVerifiedAt) {
      const token = await this.issueVerificationEmail(user, returnDevToken)
      return { message: verificationEmailMessage, ...(token && { devVerificationOtp: token }) }
    }

    return { message: verificationEmailMessage }
  }

  async login({ email, password }: LoginInput) {
    const user = await this.users.findOneBy({ email })

    if (!user || !(await this.passwordHasher.verify(password, user.passwordHash))) {
      await this.auditLogs.save(
        this.auditLogs.create({
          userId: user?.id ?? null,
          attemptedEmail: email,
          event: AuthAuditEvent.LOGIN_FAILED,
        }),
      )
      throw new UnauthorizedException('Invalid email or password')
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email before logging in')
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('This account cannot log in')
    }

    const sessionId = randomUUID()
    const refreshToken = this.tokens.createRefreshToken(sessionId)

    await this.sessions.save(
      this.sessions.create({
        id: sessionId,
        userId: user.id,
        refreshTokenHash: this.tokens.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
      }),
    )
    await this.users.update(user.id, { lastLoginAt: new Date() })
    await this.writeAuditLog(user.id, AuthAuditEvent.LOGIN_SUCCEEDED)

    return {
      accessToken: await this.tokens.createAccessToken(user.id, sessionId),
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenLifetimeSeconds,
      user: this.publicUser(user),
    }
  }

  async refresh({ refreshToken }: RefreshTokenInput) {
    const sessionId = this.tokens.sessionIdFromRefreshToken(refreshToken)

    if (!sessionId) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const session = await this.sessions.findOneBy({ id: sessionId })

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !this.tokens.matchesRefreshToken(refreshToken, session.refreshTokenHash)
    ) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.users.findOneBy({ id: session.userId })

    if (!user || !user.emailVerifiedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const nextRefreshToken = this.tokens.createRefreshToken(sessionId)
    const now = new Date()
    const updated = await this.sessions.update(
      {
        id: sessionId,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: IsNull(),
      },
      {
        refreshTokenHash: this.tokens.hashRefreshToken(nextRefreshToken),
        lastUsedAt: now,
        expiresAt: new Date(now.getTime() + refreshTokenLifetimeMs),
      },
    )

    if (updated.affected !== 1) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    return {
      accessToken: await this.tokens.createAccessToken(user.id, sessionId),
      refreshToken: nextRefreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenLifetimeSeconds,
      user: this.publicUser(user),
    }
  }

  async logout({ refreshToken }: RefreshTokenInput) {
    const sessionId = this.tokens.sessionIdFromRefreshToken(refreshToken)

    if (sessionId) {
      const session = await this.sessions.findOneBy({ id: sessionId })

      if (
        session &&
        !session.revokedAt &&
        this.tokens.matchesRefreshToken(refreshToken, session.refreshTokenHash)
      ) {
        const updated = await this.sessions.update(
          { id: sessionId, refreshTokenHash: session.refreshTokenHash, revokedAt: IsNull() },
          { revokedAt: new Date() },
        )

        if (updated.affected === 1) {
          await this.writeAuditLog(session.userId, AuthAuditEvent.LOGOUT)
        }
      }
    }

    return { message: 'Logged out' }
  }

  async requestPasswordReset({ email }: PasswordResetRequestInput, remoteAddress?: string) {
    const returnDevToken = this.authEmail.canReturnDevelopmentToken(remoteAddress)
    if (!returnDevToken) this.authEmail.assertConfigured()
    const user = await this.users.findOneBy({ email })

    if (user?.emailVerifiedAt && user.status === UserStatus.ACTIVE) {
      const token = randomInt(100000, 1000000).toString()

      await this.passwordResetTokens.save(
        this.passwordResetTokens.create({
          userId: user.id,
          tokenHash: this.hashToken(token),
          expiresAt: new Date(Date.now() + passwordResetTokenLifetimeMs),
        }),
      )
      await this.writeAuditLog(user.id, AuthAuditEvent.PASSWORD_RESET_REQUESTED)

      if (returnDevToken) {
        return { message: passwordResetMessage, devPasswordResetOtp: token }
      }

      try {
        await this.authEmail.sendPasswordResetEmail(user.email, token)
      } catch {
        this.logger.error('Password reset email could not be delivered')
      }
    }

    return { message: passwordResetMessage }
  }

  async confirmPasswordReset({ email, otp, newPassword }: PasswordResetConfirmInput) {
    const user = await this.users.findOneBy({ email })
    const tokenHash = this.hashToken(otp)
    const resetToken = user
      ? await this.passwordResetTokens.findOneBy({ userId: user.id, tokenHash, usedAt: IsNull() })
      : null

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      throw new BadRequestException('This reset link is invalid or expired')
    }

    const passwordHash = await this.passwordHasher.hash(newPassword)

    await this.dataSource.transaction(async (manager) => {
      const now = new Date()
      const claimed = await manager.getRepository(PasswordResetToken).update(
        { id: resetToken.id, usedAt: IsNull(), expiresAt: MoreThan(now) },
        { usedAt: now },
      )

      if (claimed.affected !== 1) {
        throw new BadRequestException('This reset link is invalid or expired')
      }

      await manager.getRepository(User).update(resetToken.userId, { passwordHash })
      await manager.getRepository(PasswordResetToken).update(
        { userId: resetToken.userId, usedAt: IsNull() },
        { usedAt: now },
      )
      await manager.getRepository(AuthSession).update(
        { userId: resetToken.userId, revokedAt: IsNull() },
        { revokedAt: now },
      )
      await manager.getRepository(AuthAuditLog).save(
        manager.getRepository(AuthAuditLog).create({
          userId: resetToken.userId,
          event: AuthAuditEvent.PASSWORD_RESET_COMPLETED,
        }),
      )
    })

    return { message: 'Password updated. Log in with your new password.' }
  }

  publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
    }
  }

  private async issueVerificationEmail(user: User, returnDevToken: boolean): Promise<string | undefined> {
    const token = randomInt(100000, 1000000).toString()

    if (returnDevToken) {
      await this.verificationTokens.save(
        this.verificationTokens.create({
          userId: user.id,
          tokenHash: this.hashToken(token),
          expiresAt: new Date(Date.now() + verificationTokenLifetimeMs),
        }),
      )
      await this.writeAuditLog(user.id, AuthAuditEvent.EMAIL_VERIFICATION_REQUESTED)
      return token
    }

    try {
      await this.verificationTokens.save(
        this.verificationTokens.create({
          userId: user.id,
          tokenHash: this.hashToken(token),
          expiresAt: new Date(Date.now() + verificationTokenLifetimeMs),
        }),
      )
      await this.authEmail.sendVerificationEmail(user.email, token)
      await this.writeAuditLog(user.id, AuthAuditEvent.EMAIL_VERIFICATION_REQUESTED)
    } catch {
      this.logger.error('Verification email could not be delivered')
    }
  }

  private async writeAuditLog(userId: string, event: AuthAuditEvent): Promise<void> {
    await this.auditLogs.save(this.auditLogs.create({ userId, event }))
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

}
