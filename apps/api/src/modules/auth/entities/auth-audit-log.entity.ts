import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

import { AuthAuditEvent } from './auth.enums'

@Entity('auth_audit_logs')
@Index(['userId', 'createdAt'])
export class AuthAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null

  @Column({ type: 'enum', enum: AuthAuditEvent, enumName: 'auth_audit_event' })
  event!: AuthAuditEvent

  @Column({ name: 'attempted_email', type: 'varchar', length: 320, nullable: true })
  attemptedEmail!: string | null

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}
