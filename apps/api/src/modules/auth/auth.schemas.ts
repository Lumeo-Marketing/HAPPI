import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().pipe(z.email())

export const registrationSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  role: z.enum(['client', 'therapist']),
})

export const emailVerificationSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/),
})

export const resendEmailVerificationSchema = z.object({
  email: emailSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(40).max(256),
})

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

export const passwordResetConfirmSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
export type ResendEmailVerificationInput = z.infer<
  typeof resendEmailVerificationSchema
>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>
