import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AccessTokenGuard } from './access-token.guard'
import { AuthController } from './auth.controller'
import { AuthEmailService } from './auth-email.service'
import { AuthRateLimitService } from './auth-rate-limit.service'
import { AuthService } from './auth.service'
import { AuthAuditLog } from './entities/auth-audit-log.entity'
import { AuthSession } from './entities/auth-session.entity'
import { EmailVerificationToken } from './entities/email-verification-token.entity'
import { PasswordResetToken } from './entities/password-reset-token.entity'
import { User } from './entities/user.entity'
import { PasswordHasherService } from './password-hasher.service'
import { RolesGuard } from './roles.guard'
import { TokenService } from './token.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AuthSession,
      EmailVerificationToken,
      PasswordResetToken,
      AuthAuditLog,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthEmailService,
    AuthRateLimitService,
    PasswordHasherService,
    TokenService,
    AccessTokenGuard,
    RolesGuard,
    AuthService,
  ],
  exports: [AccessTokenGuard, RolesGuard],
})
export class AuthModule {}
