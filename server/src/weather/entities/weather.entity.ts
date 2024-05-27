import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from 'src/common/abstract.entity';
import { BLD } from 'src/common/enums';

@Index(['operationBranchId', 'dateYmd', 'bld'])
@Entity()
export class Weather extends AbstractEntity {
  @Column({ comment: '기관 ID' })
  operationBranchId: number;

  @Column({ comment: '일자 (YYYYMMDD)' })
  dateYmd: number;

  @Column({ type: 'varchar', comment: '조식(B), 중식(L), 석식(D)' })
  bld: BLD;

  @Column({ comment: '최고 기온' })
  maxTemperature: number;

  @Column({ comment: '최저 기온' })
  minTemperature: number;

  @Column({ comment: '날씨 아이콘' })
  weatherIcon: string;

  @Column({ comment: '날씨 설명' })
  weatherDescription: string;
}
