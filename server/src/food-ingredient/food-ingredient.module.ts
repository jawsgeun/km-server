import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FoodIngredientService } from './food-ingredient.service';
import { FoodIngredient } from './entities/food-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodIngredient])],
  providers: [FoodIngredientService],
})
export class FoodIngredientModule {}
