import { Injectable } from '@nestjs/common';

import { FoodDataRepository } from '../repository/food-data.repository';

type UpdateFoodDataRecentServedCornerNameInput = {
  foodDataId: number;
  recentServedCornerName: string;
};

@Injectable()
export class FoodDataManualService {
  constructor(private readonly foodDataRepository: FoodDataRepository) {}
  async updateFoodDataRecentServedCornerName(
    inputList: UpdateFoodDataRecentServedCornerNameInput[],
  ) {
    for (const input of inputList) {
      await this.foodDataRepository.updateFoodData(input.foodDataId, {
        recentServedCornerName: input.recentServedCornerName,
      });
    }
  }
}
