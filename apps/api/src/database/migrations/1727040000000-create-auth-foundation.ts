import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAuthFoundation1727040000000 implements MigrationInterface {
  name = 'CreateAuthFoundation1727040000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    await queryRunner.query(
      "CREATE TYPE \"public\".\"user_role\" AS ENUM ('client', 'therapist', 'admin')",
    )
    await queryRunner.query(
      "CREATE TYPE \"public\".\"user_status\" AS ENUM ('active', 'suspended')",
    )
    await queryRunner.query(
      "CREATE TYPE \"public\".\"auth_audit_event\" AS ENUM ('registration_completed', 'email_verification_requested', 'email_verified', 'login_succeeded', 'login_failed', 'logout', 'password_reset_requested', 'password_reset_completed')",
    )
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(320) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "role" "public"."user_role" NOT NULL,
        "status" "public"."user_status" NOT NULL DEFAULT 'active',
        "email_verified_at" TIMESTAMP WITH TIME ZONE,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `)
    await queryRunner.query(`
      CREATE TABLE "auth_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "refresh_token_hash" varchar(255) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "last_used_at" TIMESTAMP WITH TIME ZONE,
        "ip_address" varchar(45),
        "user_agent" varchar(512),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_auth_sessions_refresh_token_hash" UNIQUE ("refresh_token_hash"),
        CONSTRAINT "FK_auth_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      'CREATE INDEX "IDX_auth_sessions_user_expires" ON "auth_sessions" ("user_id", "expires_at")',
    )
    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_verification_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_verification_tokens_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "FK_email_verification_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      'CREATE INDEX "IDX_email_verification_tokens_user_expires" ON "email_verification_tokens" ("user_id", "expires_at")',
    )
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_password_reset_tokens_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      'CREATE INDEX "IDX_password_reset_tokens_user_expires" ON "password_reset_tokens" ("user_id", "expires_at")',
    )
    await queryRunner.query(`
      CREATE TABLE "auth_audit_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "event" "public"."auth_audit_event" NOT NULL,
        "attempted_email" varchar(320),
        "ip_address" varchar(45),
        "user_agent" varchar(512),
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_audit_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auth_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `)
    await queryRunner.query(
      'CREATE INDEX "IDX_auth_audit_logs_user_created" ON "auth_audit_logs" ("user_id", "created_at")',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "auth_audit_logs"')
    await queryRunner.query('DROP TABLE "password_reset_tokens"')
    await queryRunner.query('DROP TABLE "email_verification_tokens"')
    await queryRunner.query('DROP TABLE "auth_sessions"')
    await queryRunner.query('DROP TABLE "users"')
    await queryRunner.query('DROP TYPE "public"."auth_audit_event"')
    await queryRunner.query('DROP TYPE "public"."user_status"')
    await queryRunner.query('DROP TYPE "public"."user_role"')
  }
}
