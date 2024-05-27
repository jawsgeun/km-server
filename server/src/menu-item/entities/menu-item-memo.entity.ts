import { AbstractEntity } from 'src/common/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

import { MenuItem } from './menu-item.entity';

@Entity()
export class MenuItemMemo extends AbstractEntity {
  @Column({ comment: '내용' })
  content: string;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.memoList, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  menuItem: MenuItem;
}
