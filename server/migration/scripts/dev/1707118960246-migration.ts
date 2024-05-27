import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707118960246 implements MigrationInterface {
  name = 'Migration1707118960246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` ADD \`activated\` tinyint NOT NULL COMMENT '활성화 여부' DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` DROP COLUMN \`activated\``,
    );
  }
}
