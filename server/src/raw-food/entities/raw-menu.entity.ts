import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { AbstractEntity } from 'src/common';
import { BLD } from 'src/common/enums';

import { RawMenuItem } from './raw-menu-item.entity';

@Entity()
export class RawMenu extends AbstractEntity {
  @Column({ comment: '메뉴 아이템명 (ex. 배추김치, 당근볶음)' })
  name: string;

  @Column({ type: 'varchar', comment: '조식(B), 중식(L), 석식(D)' })
  bld: BLD;

  @Column({ comment: '예상 식수' })
  expectedCoverCount: number;

  @Column({ comment: '실제 식수' })
  actualCoverCount: number;

  @Column({ comment: '메뉴 제공 일자 (YYYYMMDD)' })
  dateServed: number;

  @ManyToOne(
    () => OperationBranch,
    (operationBranch) => operationBranch.rawMenuList,
    {
      nullable: false,
    },
  )
  operationBranch: OperationBranch;

  @OneToMany(() => RawMenuItem, (rawMenuItem) => rawMenuItem.rawMenu, {
    cascade: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  rawMenuItemList: RawMenuItem[];

  @OneToOne(() => Menu, (menu) => menu.rawMenu, {
    nullable: false,
    cascade: true,
  })
  menu: Menu;
}
