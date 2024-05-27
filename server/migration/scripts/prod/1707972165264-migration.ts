import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707972165264 implements MigrationInterface {
  name = 'Migration1707972165264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`food_data\` ADD \`servingCount\` int NOT NULL COMMENT '제공 횟수' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` ADD \`foodDataCoverCountSynced\` tinyint NOT NULL COMMENT '음식 데이터 실식수 연동 여부' DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` DROP COLUMN \`foodDataCoverCountSynced\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_data\` DROP COLUMN \`servingCount\``,
    );
  }
}
