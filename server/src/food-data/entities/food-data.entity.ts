import { Column, Entity, Unique } from 'typeorm';
import { AbstractEntity } from 'src/common/abstract.entity';
import { BLD } from 'src/common/enums';

export enum FoodDataUtilizationStatus {
  USE = 'USE',
  UNSURE = 'UNSURE',
  NOT_USE = 'NOT_USE',
}

@Unique(['operationBranchId', 'name', 'bld'])
@Entity()
export class FoodData extends AbstractEntity {
  @Column({ comment: '기관 ID' })
  operationBranchId: number;

  @Column({ comment: '음식명 (ex. 닭볶음탕, 돈샤브샤브전골)' })
  name: string;

  @Column({ type: 'varchar', comment: '조식(B), 중식(L), 석식(D)' })
  bld: BLD;

  @Column({ comment: '최근 제공 코너명' })
  recentServedCornerName: string;

  @Column({ comment: '최근 제공 일자 (YYYYMMDD)' })
  dateRecentServed: number;

  @Column({ default: 0, comment: '제공 횟수' })
  servingCount: number;

  @Column({ default: 0, comment: '실제 식수 합계' })
  totalActualCoverCount: number;

  @Column({ default: 0, comment: '메뉴 아이템 개수' })
  totalMenuItemCount: number;

  @Column({ default: 0, comment: '최고 실제 식수' })
  maxCoverCount: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '최고 실제 식수 당시 함께 제공된 메뉴 아이템',
  })
  maxCoverCountSiblingMenuItemId: number | null;

  @Column({ comment: '메모 유무' })
  hasMemo: boolean;

  @Column({ type: 'varchar', comment: '사용 상태' })
  utilizationStatus: FoodDataUtilizationStatus;
}
