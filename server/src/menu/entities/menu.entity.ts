import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';
import { AbstractEntity } from 'src/common';
import { BLD } from 'src/common/enums';

@Entity()
export class Menu extends AbstractEntity {
  @Column({ comment: '메뉴명 (ex. 닭볶음탕)' })
  name: string;

  @Column({ type: 'varchar', comment: '조식(B), 중식(L), 석식(D)' })
  bld: BLD;

  @Column({ comment: '순서' })
  order: number;

  @Column({ comment: '예상 식수' })
  expectedCoverCount: number;

  @Column({ type: 'int', nullable: true, comment: '실제 식수' })
  actualCoverCount: number | null;

  @Column({ type: 'int', nullable: true, comment: '조리 식수' })
  editedCoverCount: number | null;

  @Column({ comment: '메뉴 제공 일자 (YYYYMMDD)' })
  dateServed: number;

  @ManyToOne(
    () => OperationBranch,
    (operationBranch) => operationBranch.menuList,
    { nullable: false },
  )
  operationBranch: OperationBranch;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
    cascade: true,
    nullable: false,
  })
  menuItemList: MenuItem[];

  @OneToOne(() => RawMenu, (rawMenu) => rawMenu.menu, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  rawMenu: RawMenu;
}
