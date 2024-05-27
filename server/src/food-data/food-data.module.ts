import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { Weather } from 'src/weather/entities/weather.entity';

import { FoodDataService } from './services/food-data.service';
import { FoodDataController } from './controllers/food-data.controller';
import { FoodData } from './entities/food-data.entity';
import { MealServiceResultController } from './controllers/meal-service-result.controller';
import { MealServiceResultService } from './services/meal-service-result.service';
import { FoodDataRepository } from './repository/food-data.repository';
import { FoodDataManualService } from './services/food-data-manual.service';
import { FoodDataTempController } from './controllers/food-data.temp.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodData,
      Menu,
      MenuItem,
      FoodIngredient,
      Weather,
    ]),
  ],
  controllers: [
    FoodDataController,
    FoodDataTempController,
    MealServiceResultController,
  ],
  providers: [
    FoodDataService,
    MealServiceResultService,
    FoodDataRepository,
    FoodDataManualService,
  ],
  exports: [FoodDataService],
})
export class FoodDataModule {}
