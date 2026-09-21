export type UserRole = 'client' | 'therapist' | 'admin'

export type TherapistVerificationStatus =
  | 'pending'
  | 'approved'
  | 'more_information_required'
  | 'rejected'
  | 'suspended'

export type SessionStatus =
  'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed'
export type Currency = 'NGN' | 'USD'
export type SessionType = 'video' | 'voice'

export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}
