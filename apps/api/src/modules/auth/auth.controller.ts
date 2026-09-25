import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common'

import { AccessTokenGuard } from './access-token.guard'
import type { AuthenticatedUser } from './access-token.guard'
import { AuthService } from './auth.service'
import { AuthRateLimitService } from './auth-rate-limit.service'
import { AuthExceptionFilter, AuthResponseInterceptor } from './auth-response'
import type { AuthRateLimitRequest } from './auth-rate-limit.service'
import {
  emailVerificationSchema,
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  refreshTokenSchema,
  registrationSchema,
  resendEmailVerificationSchema,
} from './auth.schemas'
import type {
  EmailVerificationInput,
  LoginInput,
  PasswordResetConfirmInput,
  PasswordResetRequestInput,
  RefreshTokenInput,
  RegistrationInput,
  ResendEmailVerificationInput,
} from './auth.schemas'
import { AuthValidationPipe } from './auth-validation.pipe'
import { CurrentUser } from './current-user.decorator'

@Controller('auth')
@UseInterceptors(AuthResponseInterceptor)
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rateLimits: AuthRateLimitService,
  ) {}

  @Get()
  status() {
    return {
      module: 'auth',
      status: 'ready',
    }
  }

  @Post('register')
  async register(
    @Body(new AuthValidationPipe(registrationSchema)) body: RegistrationInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('register', request, body.email)
    return this.authService.register(body, request.socket?.remoteAddress)
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new AuthValidationPipe(emailVerificationSchema))
    body: EmailVerificationInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('verifyEmail', request)
    return this.authService.verifyEmail(body)
  }

  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body(new AuthValidationPipe(resendEmailVerificationSchema))
    body: ResendEmailVerificationInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('resendVerification', request, body.email)
    return this.authService.resendVerificationEmail(body, request.socket?.remoteAddress)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new AuthValidationPipe(loginSchema)) body: LoginInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('login', request, body.email)
    return this.authService.login(body)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new AuthValidationPipe(refreshTokenSchema)) body: RefreshTokenInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('refresh', request)
    return this.authService.refresh(body)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body(new AuthValidationPipe(refreshTokenSchema)) body: RefreshTokenInput,
  ) {
    return this.authService.logout(body)
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body(new AuthValidationPipe(passwordResetRequestSchema))
    body: PasswordResetRequestInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('passwordResetRequest', request, body.email)
    return this.authService.requestPasswordReset(body, request.socket?.remoteAddress)
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(
    @Body(new AuthValidationPipe(passwordResetConfirmSchema))
    body: PasswordResetConfirmInput,
    @Req() request: AuthRateLimitRequest,
  ) {
    await this.rateLimits.check('passwordResetConfirm', request)
    return this.authService.confirmPasswordReset(body)
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user
  }
}
