import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { FoodDataModule } from 'src/food-data/food-data.module';

import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';
import { MenuItem } from './entities/menu-item.entity';
import { MenuItemMemo } from './entities/menu-item-memo.entity';
import { MenuItemSubscriber } from './entities/menu-item.entity.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem, MenuItemMemo]),
    FoodDataModule,
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService, MenuItemSubscriber],
  exports: [MenuItemService],
})
export class MenuItemModule {}
