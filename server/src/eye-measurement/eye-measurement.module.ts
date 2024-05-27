import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { RawMenuItem } from 'src/raw-food/entities/raw-menu-item.entity';
import { RawFoodModule } from 'src/raw-food/raw-food.module';
import { FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';
import { MenuItemModule } from 'src/menu-item/menu-item.module';

import { EyeMeasurementService } from './eye-measurement.service';
import { EyeMeasurementController } from './eye-measurement.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Menu,
      MenuItem,
      FoodIngredient,
      RawMenuItem,
      RawFoodIngredient,
    ]),
    RawFoodModule,
    MenuItemModule,
  ],
  controllers: [EyeMeasurementController],
  providers: [EyeMeasurementService],
})
export class EyeMeasurementModule {}
