import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/common';

import { RawFoodIngredient } from './raw-food-ingredient.entity';
import { RawMenu } from './raw-menu.entity';

@Entity()
export class RawMenuItem extends AbstractEntity {
  @Column({ comment: '메뉴 아이템명 (ex. 배추김치, 당근볶음)' })
  name: string;

  @Column({ comment: '단가' })
  unitPriceAmount: number;

  @Column({ comment: '메뉴 제공 일자 (YYYYMMDD)' })
  dateServed: number;

  @Column({ comment: '조식(B), 중식(L), 석식(D)' })
  bld: string;

  @ManyToOne(() => RawMenu, (rawMenu) => rawMenu.rawMenuItemList, {
    nullable: false,
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  rawMenu: RawMenu;

  @OneToMany(
    () => RawFoodIngredient,
    (rawFoodIngredient) => rawFoodIngredient.rawMenuItem,
    {
      cascade: true,
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  rawFoodIngredientList: RawFoodIngredient[];
}
