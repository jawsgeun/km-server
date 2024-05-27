import { NotFoundException } from '@nestjs/common';

export class FoodDataNotFoundException extends NotFoundException {
  constructor() {
    super('FoodDataNotFound');
  }
}
