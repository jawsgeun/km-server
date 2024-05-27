import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/common/abstract.entity';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import {
  findFirstKoreanSpaceGroup,
  removeBeforeKoreanOrNumber,
} from 'src/common';

@Entity()
export class FoodIngredient extends AbstractEntity {
  @Column({ comment: '식재료 명 (ex. 배추김치, 당근볶음)' })
  name: string;

  @Column({ comment: '잔식량(g)' })
  remainingFoodAmount: number;

  @Column({ comment: '잔식 금액' })
  remainingPriceAmount: number;

  @Column({ comment: '단가' })
  unitPriceAmount: number;

  @Column({ comment: '제공 1인분' })
  servingSize: number;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.foodIngredientList, {
    nullable: false,
  })
  menuItem: MenuItem;

  @Column()
  rawFoodIngredientId: number;

  @BeforeInsert()
  refineMenuName() {
    const prefixRemoved = removeBeforeKoreanOrNumber(this.name);
    const validName = findFirstKoreanSpaceGroup(prefixRemoved);
    this.name = validName.trim();
  }
}
