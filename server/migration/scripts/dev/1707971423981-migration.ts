import { MigrationInterface, QueryRunner } from 'typeorm';

// data migration script

// UPDATE menu_item
// SET foodDataCoverCountSynced = 1
// WHERE menu_item.foodDataId IS NOT NULL;

// UPDATE food_data fd
// SET servingCount = (
// 	 SELECT COUNT(*)
// 	 FROM menu_item
// 	 WHERE foodDataId = fd.id
// );

export class Migration1707971423981 implements MigrationInterface {
  name = 'Migration1707971423981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` ADD \`foodDataCoverCountSynced\` tinyint NOT NULL COMMENT '음식 데이터 실식수 연동 여부' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_data\` ADD \`servingCount\` int NOT NULL COMMENT '제공 횟수' DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`food_data\` DROP COLUMN \`servingCount\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` DROP COLUMN \`foodDataCoverCountSynced\``,
    );
  }
}
