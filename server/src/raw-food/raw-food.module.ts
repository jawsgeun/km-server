import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationBranchModule } from 'src/operation-branch/operation-branch.module';
import { Menu } from 'src/menu/entities/menu.entity';

import { RawMenuItem } from './entities/raw-menu-item.entity';
import { RawFoodIngredient } from './entities/raw-food-ingredient.entity';
import { RawFoodIngredientService } from './services/raw-food-ingredient.service';
import { RawMenuItemService } from './services/raw-menu-item.service';
import { RawMenuService } from './services/raw-menu.service';
import { RawMenu } from './entities/raw-menu.entity';
import { RawMenuItemController } from './controllers/raw-menu-item.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RawMenuItem, RawFoodIngredient, RawMenu, Menu]),
    OperationBranchModule,
  ],
  providers: [RawFoodIngredientService, RawMenuItemService, RawMenuService],
  controllers: [RawMenuItemController],
  exports: [RawFoodIngredientService, RawMenuItemService, RawMenuService],
})
export class RawFoodModule {}
