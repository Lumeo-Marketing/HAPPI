import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity('password_reset_tokens')
@Index(['userId', 'expiresAt'])
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 255 })
  tokenHash!: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}
