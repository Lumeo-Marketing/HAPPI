export enum UserRole {
  CLIENT = 'client',
  THERAPIST = 'therapist',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum AuthAuditEvent {
  REGISTRATION_COMPLETED = 'registration_completed',
  EMAIL_VERIFICATION_REQUESTED = 'email_verification_requested',
  EMAIL_VERIFIED = 'email_verified',
  LOGIN_SUCCEEDED = 'login_succeeded',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
}
