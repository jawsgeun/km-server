import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from 'src/menu/entities/menu.entity';

import { WeeklyFoodRankingController } from './weekly-food-ranking.controller';
import { WeeklyFoodRankingService } from './weekly-food-ranking.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  controllers: [WeeklyFoodRankingController],
  providers: [WeeklyFoodRankingService],
})
export class WeeklyFoodRankingModule {}
