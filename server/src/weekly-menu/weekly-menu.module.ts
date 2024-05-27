import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { FoodData } from 'src/food-data/entities/food-data.entity';
import { MenuItemModule } from 'src/menu-item/menu-item.module';

import { WeeklyMenuController } from './controllers/weekly-menu.controller';
import { WeeklyMenuItemController } from './controllers/weekly-menu-item.controller';
import { WeeklyMenuService } from './services/weekly-menu.service';
import { WeeklyMenuItemService } from './services/weekly-menu-item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, MenuItem, FoodData]),
    MenuItemModule,
  ],
  controllers: [WeeklyMenuController, WeeklyMenuItemController],
  providers: [WeeklyMenuService, WeeklyMenuItemService],
})
export class WeeklyMenuModule {}
