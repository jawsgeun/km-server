import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { type RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';

type RawFoodIngredientField = keyof RawFoodIngredient;

export class RawFoodIngredientNotFoundException extends NotFoundException {
  constructor() {
    super('RawFoodIngredientNotFound');
  }
}

export class RawFoodIngredientInvalidException extends UnprocessableEntityException {
  constructor(invalidFieldList: RawFoodIngredientField[]) {
    super(`RawFoodIngredientInvalidException (${invalidFieldList.join(',')})`);
  }
}
