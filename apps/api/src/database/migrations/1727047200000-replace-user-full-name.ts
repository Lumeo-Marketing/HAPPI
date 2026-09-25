import type { MigrationInterface, QueryRunner } from 'typeorm'

export class ReplaceUserFullName1727047200000 implements MigrationInterface {
  name = 'ReplaceUserFullName1727047200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "first_name" varchar(60) NOT NULL DEFAULT \'\'',
    )
    await queryRunner.query(
      'ALTER TABLE "users" ADD "last_name" varchar(60) NOT NULL DEFAULT \'\'',
    )
    await queryRunner.query(`
      UPDATE "users"
      SET
        "first_name" = left(split_part(trim("full_name"), ' ', 1), 60),
        "last_name" = left(
          trim(regexp_replace(trim("full_name"), '^[^[:space:]]+[[:space:]]*', '')),
          60
        )
    `)
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "first_name" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "last_name" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "full_name"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "full_name" varchar(120) NOT NULL DEFAULT \'\'',
    )
    await queryRunner.query(`
      UPDATE "users"
      SET "full_name" = trim("first_name" || ' ' || "last_name")
    `)
    await queryRunner.query('ALTER TABLE "users" ALTER COLUMN "full_name" DROP DEFAULT')
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "last_name"')
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "first_name"')
  }
}
