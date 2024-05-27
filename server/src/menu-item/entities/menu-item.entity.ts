import { AbstractEntity } from 'src/common/abstract.entity';
import { FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { MenuItemMemo } from './menu-item-memo.entity';

@Entity()
export class MenuItem extends AbstractEntity {
  @Column({ comment: '메뉴 아이템명 (ex. 배추김치, 당근볶음)' })
  name: string;

  @Column({ comment: '잔식량(g)' })
  remainingFoodAmount: number;

  @Column({ comment: '잔식 금액' })
  remainingPriceAmount: number;

  @Column({ comment: '단가' })
  unitPriceAmount: number;

  @Column({ comment: '제공 1인분 (1인량 계획)' })
  servingSize: number;

  @Column({ comment: '식재료 합계 잔식량(g)' })
  totalRemainingFoodAmount: number;

  @Column({ comment: '식재료 합계 잔식 금액' })
  totalRemainingPriceAmount: number;

  @Column({ default: true, comment: '활성화 여부' })
  activated: boolean;

  @Column()
  rawMenuItemId: number;

  @Column({ default: false, comment: '음식 데이터 실식수 연동 여부' })
  foodDataCoverCountSynced: boolean;

  @Column({ comment: '제공 일자 (YYYYMMDD)' })
  dateServed: number;

  @Column({ type: 'int', nullable: true })
  foodDataId: number | null;

  @ManyToOne(() => Menu, (menu) => menu.menuItemList, {
    nullable: false,
    cascade: ['update'],
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  menu: Menu;

  @OneToMany(
    () => FoodIngredient,
    (foodIngredient) => foodIngredient.menuItem,
    { nullable: false },
  )
  foodIngredientList: FoodIngredient[];

  @OneToMany(() => MenuItemMemo, (menuItemMemo) => menuItemMemo.menuItem, {
    cascade: true,
  })
  memoList: MenuItemMemo[];
}
