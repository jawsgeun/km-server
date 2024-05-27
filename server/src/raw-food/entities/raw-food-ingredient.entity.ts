import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/common';

import { RawMenuItem } from './raw-menu-item.entity';

@Entity()
export class RawFoodIngredient extends AbstractEntity {
  @Column({ comment: '식재료명 (ex. 양상추, 당근, 닭고기)' })
  name: string;

  @Column({ comment: '단가' })
  unitPriceAmount: number;

  @Column({ comment: '조리량' })
  cookQuantity: number;

  @ManyToOne(
    () => RawMenuItem,
    (rawMenuItem) => rawMenuItem.rawFoodIngredientList,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  rawMenuItem: RawMenuItem;
}
