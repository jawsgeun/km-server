import { Column, Entity, OneToMany } from 'typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';
import { AbstractEntity } from 'src/common';

import { OperationBranchManager } from './operation-branch-manager.entity';

export enum CompanyName {
  ARAMARK = 'ARAMARK',
}

@Entity()
export class OperationBranch extends AbstractEntity {
  @Column({ type: 'varchar', comment: '소속 회사명' })
  companyName: CompanyName;

  @Column({ comment: '기관명' })
  name: string;

  @Column({ comment: '기관 코드' })
  code: string;

  @Column({ comment: '로그인 코드' })
  loginCode: string;

  @Column({ type: 'float', comment: '위도' })
  latitude: number;

  @Column({ type: 'float', comment: '경도' })
  longitude: number;

  @OneToMany(
    () => OperationBranchManager,
    (operationBranchManager) => operationBranchManager.operationBranch,
    {
      nullable: false,
      cascade: true,
    },
  )
  managerList: OperationBranchManager[];

  @OneToMany(() => Menu, (menu) => menu.operationBranch, {
    nullable: false,
  })
  menuList: Menu[];

  @OneToMany(() => RawMenu, (menu) => menu.operationBranch, {
    nullable: false,
  })
  rawMenuList: RawMenu[];
}
