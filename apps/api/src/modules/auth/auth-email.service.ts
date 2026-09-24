import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class AuthEmailService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    const apiKey = this.config.get<string>('RESEND_API_KEY')
    const sender = this.config.get<string>('EMAIL_FROM')
    return Boolean(apiKey && sender && !sender.endsWith('@example.com'))
  }

  canReturnDevelopmentToken(remoteAddress?: string): boolean {
    return (
      !this.isConfigured() &&
      this.config.get<string>('NODE_ENV') === 'development' &&
      this.config.get<string>('AUTH_DEV_RETURN_TOKENS') === 'true' &&
      !this.config.get<string>('DATABASE_URL') &&
      ['localhost', '127.0.0.1', '::1'].includes(
        this.config.get<string>('DATABASE_HOST') ?? '',
      ) &&
      ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remoteAddress ?? '')
    )
  }

  assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Email delivery is not configured')
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    await this.sendAuthEmail(email, token, 'Verify your HAPPI email address', true)
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.sendAuthEmail(email, token, 'Reset your HAPPI password', false)
  }

  private async sendAuthEmail(
    email: string,
    token: string,
    subject: string,
    isVerificationOtp: boolean,
  ): Promise<void> {
    this.assertConfigured()
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY')

    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: this.config.getOrThrow<string>('EMAIL_FROM'),
      to: email,
      subject,
      html: isVerificationOtp
        ? `<p>Your HAPPI email verification code is:</p><p><strong>${token}</strong></p><p>This code expires in 24 hours.</p>`
        : `<p>Use this password reset token on the password reset screen:</p><p><strong>${token}</strong></p><p>This token expires in 30 minutes.</p>`,
    })

    if (result.error) {
      throw new ServiceUnavailableException('Unable to send authentication email')
    }
  }
}
