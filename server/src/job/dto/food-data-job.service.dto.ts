import { BLD } from 'src/common/enums';
import { type FoodData } from 'src/food-data/entities/food-data.entity';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { type Menu } from 'src/menu/entities/menu.entity';

export class SyncFoodDataDto {
  operationBranchId: number;
}

export class UpsertFoodDataDto {
  operationBranchId: number;
  menuItemName: string;
  bld: BLD;
  menuItemList: MenuItem[];
}
export class UpdateFoodDataDto {
  operationBranchId: number;
  foodData: FoodData;
  menuItemList: MenuItem[];
}

export class CreateFoodDataDto {
  operationBranchId: number;
  menuItemName: string;
  bld: BLD;
  menuItemList: MenuItem[];
}

export class GetMaxCoverCountSiblingMenuItemIdDto {
  operationBranchId: number;
  maxCoverCountMenu: Menu;
  foodData: FoodData | null;
}
