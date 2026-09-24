import type { UserRole } from '@happi/types'

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: Exclude<UserRole, 'admin'>
}

export interface VerifyEmailRequest {
  email: string
  otp: string
}

export interface EmailRequest {
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified: boolean
}

export interface AuthSessionResponse {
  statusCode: number
  user: AuthUser
}

export interface AuthStatusResponse {
  statusCode: number
  module: 'auth'
  status: 'ready'
}

export interface MessageResponse {
  statusCode: number
  message: string
  devVerificationOtp?: string
  devPasswordResetToken?: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string
  error?: string
}

export function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function getApiErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return error.statusCode
  }
}

export interface CurrentUserResponse extends AuthUser {
  statusCode: number
}

const AUTH_BASE_URL = '/api/auth'

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const result = (await response.json()) as T

  if (!response.ok) {
    throw result
  }

  return result
}

function post<TResponse, TBody>(path: string, body: TBody) {
  return authRequest<TResponse>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const authService = {
  getStatus: () => authRequest<AuthStatusResponse>(''),

  register: (body: RegisterRequest) =>
    post<MessageResponse, RegisterRequest>('/register', body),

  verifyEmail: (body: VerifyEmailRequest) =>
    post<MessageResponse, VerifyEmailRequest>('/verify-email', body),

  resendVerificationEmail: (body: EmailRequest) =>
    post<MessageResponse, EmailRequest>('/resend-verification-email', body),

  login: (body: LoginRequest) =>
    post<AuthSessionResponse, LoginRequest>('/login', body),

  refresh: () => post<AuthSessionResponse, Record<string, never>>('/refresh', {}),

  logout: () => post<MessageResponse, Record<string, never>>('/logout', {}),

  requestPasswordReset: (body: EmailRequest) =>
    post<MessageResponse, EmailRequest>('/password-reset/request', body),

  confirmPasswordReset: (body: ResetPasswordRequest) =>
    post<MessageResponse, ResetPasswordRequest>(
      '/password-reset/confirm',
      body,
    ),

  getCurrentUser: async () => {
    try {
      return await authRequest<CurrentUserResponse>('/me')
    } catch (error) {
      if (getApiErrorStatus(error) !== 401) throw error

      await authService.refresh()
      return authRequest<CurrentUserResponse>('/me')
    }
  },
}
