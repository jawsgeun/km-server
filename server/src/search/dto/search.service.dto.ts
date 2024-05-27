import { BLD } from 'src/common/enums';
import {
  type FoodData,
  FoodDataUtilizationStatus,
} from 'src/food-data/entities/food-data.entity';

export class SearchDto {
  keyword: string;
  operationBranchId: number;
}

export class SearchResultDto {
  foodDataId: number;
  name: string;
  bld: BLD;
  utilizationStatus: FoodDataUtilizationStatus;
  dateRecentServed: number;

  static of(foodData: FoodData): SearchResultDto {
    return {
      foodDataId: foodData.id,
      name: foodData.name,
      bld: foodData.bld,
      utilizationStatus: foodData.utilizationStatus,
      dateRecentServed: foodData.dateRecentServed,
    };
  }
}
