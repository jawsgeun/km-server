import { NotFoundException } from '@nestjs/common';

export class FoodIngredientNotFoundException extends NotFoundException {
  constructor() {
    super('FoodIngredientNotFound');
  }
}
