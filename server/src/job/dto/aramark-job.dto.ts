import { BLD } from 'src/common/enums';
import { type RawMenu } from 'src/raw-food/entities/raw-menu.entity';

export class UpsertRawMenuDto {
  dateYYYYMMDD: string;
  branchCode: string;
}
export class UpsertRawMenuItemAndRawFoodIngredientDto {
  dateYYYYMMDD: string;
  branchCode: string;
}

export class AaramarkMenuItemDto {
  branchName: string;
  branchCode: string;
  menuDateYYYYMMDD: number;
  menuName: string;
  BLD: BLD;
  expectedCoverCount: number;
  actualCoverCount: number;
  menuItemName: string;
  menuItemCode: string;
  menuItemSeq: string;
  menuItemUnitPriceAmount: number;
  foodIngredientName: string;
  foodIngredientCode: string;
  foodIngredientUnitPriceAmount: number;
  foodIngredientAmount: number;
  foodIngredientAmountUnit: string;
}

export class ConvertToRawMenuItemEntityDtoDto {
  aramarkMenuItemDtoList: AaramarkMenuItemDto[];
  rawMenuList: RawMenu[];
}

export class ConvertToRawMenuEntityDtoDto {
  aramarkMenuItemDtoList: AaramarkMenuItemDto[];
}
