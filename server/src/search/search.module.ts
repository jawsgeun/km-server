import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodData } from 'src/food-data/entities/food-data.entity';

import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FoodData])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
