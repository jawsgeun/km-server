import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706592015115 implements MigrationInterface {
  name = 'Migration1706592015115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` DROP COLUMN \`latitude\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` ADD \`latitude\` float NOT NULL COMMENT '위도'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` DROP COLUMN \`longitude\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` ADD \`longitude\` float NOT NULL COMMENT '경도'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` DROP COLUMN \`longitude\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` ADD \`longitude\` int NOT NULL COMMENT '경도'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` DROP COLUMN \`latitude\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` ADD \`latitude\` int NOT NULL COMMENT '위도'`,
    );
  }
}
