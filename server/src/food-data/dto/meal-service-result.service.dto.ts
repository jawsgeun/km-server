import { BLD } from 'src/common/enums';
import { type FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { type Menu } from 'src/menu/entities/menu.entity';

export enum MealServiceResultType {
  MENU_ITEM = 'MENU_ITEM',
  FOOD_INGREDIENT = 'FOOD_INGREDIENT',
}

export class GetMealServiceResultListDto {
  foodDataId: number;
  page: number;
  sizePerPage: number;
}

export class CalulateServingSizeReductionDto {
  servingSize: number;
  servingSizeSuggestion: number;
  actualCoverCount: number | null;
}

export class CalulateServingSizeSuggestionDto {
  servingSize: number;
  expectedCoverCount: number;
  remainingFoodAmount: number;
  actualCoverCount: number | null;
  editedCoverCount: number | null;
}

export class GetServingSizeProperLevelDto {
  servingSizeReduction: number;
  servingSize: number;
}

export class ConvertToMealServiceFoodIngredientDtoDto {
  menu: Menu;
  foodIngredient: FoodIngredient;
}
export class ConvertToMealServiceMenuItemDtoDto {
  menu: Menu;
  menuItem: MenuItem;
}

export class GetMealServiceResultDetailDto {
  operationBranchId: number;
  mealServiceResultId: number;
  type: MealServiceResultType;
}

export class GetSiblingMenuListDto {
  operationBranchId: number;
  bld: BLD;
  dateServed: number;
}

export interface GetMealServiceResultMenuItemDetailInput {
  menuItemId: number;
  operationBranchId: number;
}

export interface GetMealServiceResultFoodIngredientDetailInput {
  foodIngredientId: number;
  operationBranchId: number;
}
