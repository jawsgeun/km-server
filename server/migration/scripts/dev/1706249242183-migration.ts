import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706249242183 implements MigrationInterface {
  name = 'Migration1706249242183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_b6062034b71d344932620b5ec8\` ON \`food_data\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`weather\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`operationBranchId\` int NOT NULL COMMENT '기관 ID', \`dateYmd\` int NOT NULL COMMENT '일자 (YYYYMMDD)', \`bld\` varchar(255) NOT NULL COMMENT '조식(B), 중식(L), 석식(D)', \`maxTemperature\` int NOT NULL COMMENT '최고 기온', \`minTemperature\` int NOT NULL COMMENT '최저 기온', \`weatherIcon\` varchar(255) NOT NULL COMMENT '날씨 아이콘', \`weatherDescription\` varchar(255) NOT NULL COMMENT '날씨 설명', INDEX \`IDX_540025724eeeddba341e10dfc7\` (\`operationBranchId\`, \`dateYmd\`, \`bld\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_data\` ADD \`operationBranchId\` int NOT NULL COMMENT '기관 ID'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_b6cba97c4ea11533f25f24f99e\` ON \`food_data\` (\`operationBranchId\`, \`name\`, \`bld\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_b6cba97c4ea11533f25f24f99e\` ON \`food_data\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_data\` DROP COLUMN \`operationBranchId\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_540025724eeeddba341e10dfc7\` ON \`weather\``,
    );
    await queryRunner.query(`DROP TABLE \`weather\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_b6062034b71d344932620b5ec8\` ON \`food_data\` (\`name\`, \`bld\`)`,
    );
  }
}
