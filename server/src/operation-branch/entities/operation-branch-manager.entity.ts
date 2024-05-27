import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/common';

import { OperationBranch } from './operation-branch.entity';

@Entity()
export class OperationBranchManager extends AbstractEntity {
  @Column({ comment: '매니저 명' })
  name: string;

  @Column({ type: 'varchar', nullable: true, comment: '전화 번호' })
  tel: string | null;

  @Column({ type: 'varchar', nullable: true, comment: '전화 번호 국가번호' })
  telCountryCode: string | null;

  @Column({ type: 'varchar', nullable: true, comment: '이메일' })
  email: string | null;

  @ManyToOne(
    () => OperationBranch,
    (operationBranch) => operationBranch.managerList,
    { nullable: false },
  )
  operationBranch: OperationBranch;
}
