import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1708491261852 implements MigrationInterface {
  name = 'Migration1708491261852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` ADD \`dateServed\` int NOT NULL COMMENT '제공 일자 (YYYYMMDD)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` DROP COLUMN \`dateServed\``,
    );
  }
}
