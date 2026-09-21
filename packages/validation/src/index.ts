import { z } from 'zod'

export const emailSchema = z.email().trim().toLowerCase()

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
})

export const registrationSchema = loginSchema.extend({
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(['client', 'therapist']),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
