import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706082108077 implements MigrationInterface {
  name = 'Migration1706082108077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`operation_branch_manager\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '매니저 명', \`tel\` varchar(255) NULL COMMENT '전화 번호', \`telCountryCode\` varchar(255) NULL COMMENT '전화 번호 국가번호', \`email\` varchar(255) NULL COMMENT '이메일', \`operationBranchId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` CHANGE \`name\` \`name\` varchar(255) NOT NULL COMMENT '기관명'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` CHANGE \`code\` \`code\` varchar(255) NOT NULL COMMENT '기관 코드'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch_manager\` ADD CONSTRAINT \`FK_912dd20cf623bfc95dc08b20c31\` FOREIGN KEY (\`operationBranchId\`) REFERENCES \`operation_branch\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`operation_branch_manager\` DROP FOREIGN KEY \`FK_912dd20cf623bfc95dc08b20c31\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` CHANGE \`code\` \`code\` varchar(255) NOT NULL COMMENT '지점 코드'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`operation_branch\` CHANGE \`name\` \`name\` varchar(255) NOT NULL COMMENT '지점명'`,
    );
    await queryRunner.query(`DROP TABLE \`operation_branch_manager\``);
  }
}
