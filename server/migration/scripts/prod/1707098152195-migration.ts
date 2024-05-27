import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707098152195 implements MigrationInterface {
  name = 'Migration1707098152195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu\` ADD \`order\` int NOT NULL COMMENT '순서'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`menu\` DROP COLUMN \`order\``);
  }
}
