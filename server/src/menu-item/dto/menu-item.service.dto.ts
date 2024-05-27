import { BLD } from 'src/common/enums';
import { Menu } from 'src/menu/entities/menu.entity';

export class FindAllMenuItemDto {
  dateServed: number;
  bld: BLD;
  operationBranchId: number;
}

export class CreateMenuItemDto {
  name: string;
  remainingFoodAmount: number;
  remainingPriceAmount: number;
  menu: Menu;
  rawMenuItemId: number;
  rawFoodIngredientId: number | null;
}

export class CreateManyMenuItemDto {
  menuItemDtoList: CreateMenuItemDto[];
}

export class UpdateMenuItemDto {
  menuItemId: number;
  activated: boolean;
}
