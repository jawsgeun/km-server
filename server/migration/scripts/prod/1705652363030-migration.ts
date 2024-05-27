import { MigrationInterface, QueryRunner } from 'typeorm';

// production 최초 배포 schema sync
export class Migration1705652363030 implements MigrationInterface {
  name = 'Migration1705652363030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`food_ingredient\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '식재료 명 (ex. 배추김치, 당근볶음)', \`remainingFoodAmount\` int NOT NULL COMMENT '잔식량(g)', \`remainingPriceAmount\` int NOT NULL COMMENT '잔식 금액', \`unitPriceAmount\` int NOT NULL COMMENT '단가', \`servingSize\` int NOT NULL COMMENT '제공 1인분', \`rawFoodIngredientId\` int NOT NULL, \`menuItemId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`raw_food_ingredient\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '식재료명 (ex. 양상추, 당근, 닭고기)', \`unitPriceAmount\` int NOT NULL COMMENT '단가', \`cookQuantity\` int NOT NULL COMMENT '조리량', \`rawMenuItemId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`raw_menu_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '메뉴 아이템명 (ex. 배추김치, 당근볶음)', \`unitPriceAmount\` int NOT NULL COMMENT '단가', \`dateServed\` int NOT NULL COMMENT '메뉴 제공 일자 (YYYYMMDD)', \`bld\` varchar(255) NOT NULL COMMENT '조식(B), 중식(L), 석식(D)', \`rawMenuId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`raw_menu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '메뉴 아이템명 (ex. 배추김치, 당근볶음)', \`bld\` varchar(255) NOT NULL COMMENT '조식(B), 중식(L), 석식(D)', \`expectedCoverCount\` int NOT NULL COMMENT '예상 식수', \`actualCoverCount\` int NOT NULL COMMENT '실제 식수', \`dateServed\` int NOT NULL COMMENT '메뉴 제공 일자 (YYYYMMDD)', \`operationBranchId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`operation_branch\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`companyName\` varchar(255) NOT NULL COMMENT '소속 회사명', \`name\` varchar(255) NOT NULL COMMENT '지점명', \`code\` varchar(255) NOT NULL COMMENT '지점 코드', \`loginCode\` varchar(255) NOT NULL COMMENT '로그인 코드', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '메뉴명 (ex. 닭볶음탕)', \`bld\` varchar(255) NOT NULL COMMENT '조식(B), 중식(L), 석식(D)', \`expectedCoverCount\` int NOT NULL COMMENT '예상 식수', \`actualCoverCount\` int NULL COMMENT '실제 식수', \`editedCoverCount\` int NULL COMMENT '조리 식수', \`dateServed\` int NOT NULL COMMENT '메뉴 제공 일자 (YYYYMMDD)', \`operationBranchId\` int NOT NULL, \`rawMenuId\` int NOT NULL, UNIQUE INDEX \`REL_ba49969063a9a224cdc631b452\` (\`rawMenuId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu_item\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '메뉴 아이템명 (ex. 배추김치, 당근볶음)', \`remainingFoodAmount\` int NOT NULL COMMENT '잔식량(g)', \`remainingPriceAmount\` int NOT NULL COMMENT '잔식 금액', \`unitPriceAmount\` int NOT NULL COMMENT '단가', \`servingSize\` int NOT NULL COMMENT '제공 1인분 (1인량 계획)', \`totalRemainingFoodAmount\` int NOT NULL COMMENT '식재료 합계 잔식량(g)', \`totalRemainingPriceAmount\` int NOT NULL COMMENT '식재료 합계 잔식 금액', \`rawMenuItemId\` int NOT NULL, \`foodDataId\` int NULL, \`menuId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`menu_item_memo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`content\` varchar(255) NOT NULL COMMENT '내용', \`menuItemId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`food_data\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dateUpdated\` datetime(6) NOT NULL COMMENT '수정일자' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dateCreated\` datetime(6) NOT NULL COMMENT '생성일자' DEFAULT CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL COMMENT '음식명 (ex. 닭볶음탕, 돈샤브샤브전골)', \`bld\` varchar(255) NOT NULL COMMENT '조식(B), 중식(L), 석식(D)', \`recentServedCornerName\` varchar(255) NOT NULL COMMENT '최근 제공 코너명', \`dateRecentServed\` int NOT NULL COMMENT '최근 제공 일자 (YYYYMMDD)', \`totalActualCoverCount\` int NOT NULL COMMENT '실제 식수 합계' DEFAULT '0', \`totalMenuItemCount\` int NOT NULL COMMENT '메뉴 아이템 개수' DEFAULT '0', \`maxCoverCount\` int NOT NULL COMMENT '최고 실제 식수' DEFAULT '0', \`maxCoverCountSiblingMenuItemId\` int NULL COMMENT '최고 실제 식수 당시 함께 제공된 메뉴 아이템', \`hasMemo\` tinyint NOT NULL COMMENT '메모 유무', \`utilizationStatus\` varchar(255) NOT NULL COMMENT '사용 상태', UNIQUE INDEX \`IDX_b6062034b71d344932620b5ec8\` (\`name\`, \`bld\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_ingredient\` ADD CONSTRAINT \`FK_58e4186adf7fb792d0ca2cdb6a1\` FOREIGN KEY (\`menuItemId\`) REFERENCES \`menu_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_food_ingredient\` ADD CONSTRAINT \`FK_5881dcb9ded90590fc38440bdcd\` FOREIGN KEY (\`rawMenuItemId\`) REFERENCES \`raw_menu_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_menu_item\` ADD CONSTRAINT \`FK_3f7b96c64858d38ceeaf47cdf34\` FOREIGN KEY (\`rawMenuId\`) REFERENCES \`raw_menu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_menu\` ADD CONSTRAINT \`FK_6d29e73481c8db2b1dd8c4a9706\` FOREIGN KEY (\`operationBranchId\`) REFERENCES \`operation_branch\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu\` ADD CONSTRAINT \`FK_31f7a5d7036e360cbe9aca854c3\` FOREIGN KEY (\`operationBranchId\`) REFERENCES \`operation_branch\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu\` ADD CONSTRAINT \`FK_ba49969063a9a224cdc631b452a\` FOREIGN KEY (\`rawMenuId\`) REFERENCES \`raw_menu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` ADD CONSTRAINT \`FK_a686871e76438259418aa5faceb\` FOREIGN KEY (\`menuId\`) REFERENCES \`menu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_memo\` ADD CONSTRAINT \`FK_4eb6aa6335dfb96970334acdb77\` FOREIGN KEY (\`menuItemId\`) REFERENCES \`menu_item\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_memo\` DROP FOREIGN KEY \`FK_4eb6aa6335dfb96970334acdb77\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item\` DROP FOREIGN KEY \`FK_a686871e76438259418aa5faceb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu\` DROP FOREIGN KEY \`FK_ba49969063a9a224cdc631b452a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu\` DROP FOREIGN KEY \`FK_31f7a5d7036e360cbe9aca854c3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_menu\` DROP FOREIGN KEY \`FK_6d29e73481c8db2b1dd8c4a9706\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_menu_item\` DROP FOREIGN KEY \`FK_3f7b96c64858d38ceeaf47cdf34\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`raw_food_ingredient\` DROP FOREIGN KEY \`FK_5881dcb9ded90590fc38440bdcd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`food_ingredient\` DROP FOREIGN KEY \`FK_58e4186adf7fb792d0ca2cdb6a1\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b6062034b71d344932620b5ec8\` ON \`food_data\``,
    );
    await queryRunner.query(`DROP TABLE \`food_data\``);
    await queryRunner.query(`DROP TABLE \`menu_item_memo\``);
    await queryRunner.query(`DROP TABLE \`menu_item\``);
    await queryRunner.query(
      `DROP INDEX \`REL_ba49969063a9a224cdc631b452\` ON \`menu\``,
    );
    await queryRunner.query(`DROP TABLE \`menu\``);
    await queryRunner.query(`DROP TABLE \`operation_branch\``);
    await queryRunner.query(`DROP TABLE \`raw_menu\``);
    await queryRunner.query(`DROP TABLE \`raw_menu_item\``);
    await queryRunner.query(`DROP TABLE \`raw_food_ingredient\``);
    await queryRunner.query(`DROP TABLE \`food_ingredient\``);
  }
}
