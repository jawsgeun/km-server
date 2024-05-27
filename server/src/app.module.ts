import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuModule } from './menu/menu.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { OperationBranchModule } from './operation-branch/operation-branch.module';
import { JobModule } from './job/job.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';
import { RawFoodModule } from './raw-food/raw-food.module';
import { AppController } from './app.controller';
import { EyeMeasurementModule } from './eye-measurement/eye-measurement.module';
import { WeeklyFoodRankingModule } from './weekly-food-ranking/weekly-food-ranking.module';
import { FoodIngredientModule } from './food-ingredient/food-ingredient.module';
import { FoodDataModule } from './food-data/food-data.module';
import { WeeklyMenuModule } from './weekly-menu/weekly-menu.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    JobModule,
    OperationBranchModule,
    RawFoodModule,
    MenuModule,
    MenuItemModule,
    SharedModule,
    EyeMeasurementModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        return apiConfigService.typeOrmConfig;
      },
    }),
    WeeklyFoodRankingModule,
    FoodIngredientModule,
    FoodDataModule,
    WeeklyMenuModule,
    SearchModule,
    AuthModule,
    WeatherModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
