import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RawFoodModule } from 'src/raw-food/raw-food.module';
import { OperationBranchModule } from 'src/operation-branch/operation-branch.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMenuItem } from 'src/raw-food/entities/raw-menu-item.entity';
import { RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { FoodData } from 'src/food-data/entities/food-data.entity';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { Weather } from 'src/weather/entities/weather.entity';

import { JobService } from './job.service';
import { AramarkJobService } from './services/aramark-job.service';
import { AramarkApiService } from './services/aramark-api.service';
import { FoodDataJobService } from './services/food-data-job.service';
import { WeatherApiService } from './services/weather-api.service';
import { WeatherJobService } from './services/weather-job.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RawMenu,
      RawMenuItem,
      RawFoodIngredient,
      Menu,
      MenuItem,
      FoodData,
      OperationBranch,
      Weather,
    ]),
    HttpModule,
    OperationBranchModule,
    RawFoodModule,
    MenuItemModule,
  ],
  providers: [
    JobService,
    AramarkJobService,
    AramarkApiService,
    FoodDataJobService,
    WeatherApiService,
    WeatherJobService,
  ],
  exports: [JobService],
})
export class JobModule {}
