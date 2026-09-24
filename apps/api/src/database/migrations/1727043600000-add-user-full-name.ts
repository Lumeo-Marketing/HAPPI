import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserFullName1727043600000 implements MigrationInterface {
  name = 'AddUserFullName1727043600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "full_name" varchar(120) NOT NULL',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "full_name"')
  }
}
