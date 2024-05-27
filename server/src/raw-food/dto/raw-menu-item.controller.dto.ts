import { IsEnum, IsString } from 'class-validator';
import { IsYYYYMMDD } from 'src/common/decorators';
import { BLD } from 'src/common/enums';

class RawFoodIngredientDto {
  id: number;
  name: string;

  constructor(rawMenu: RawFoodIngredientDto) {
    this.id = rawMenu.id;
    this.name = rawMenu.name;
  }
}

export class RawMenuItemDto {
  id: number;
  name: string;
  bld: string;
  dateServed: number;
  rawFoodIngredientList: RawFoodIngredientDto[];

  constructor(rawMenu: RawMenuItemDto) {
    this.id = rawMenu.id;
    this.name = rawMenu.name;
    this.bld = rawMenu.bld;
    this.dateServed = rawMenu.dateServed;
    this.rawFoodIngredientList = rawMenu.rawFoodIngredientList.map(
      (rawFoodIngredient) => new RawFoodIngredientDto(rawFoodIngredient),
    );
  }
}

export class GetRawMenuItemListRequestQueryDto {
  @IsYYYYMMDD()
  dateServedYYYYMMDD: string;
  @IsEnum(BLD)
  bld: BLD;
  @IsString()
  operationBranchId: string;
}
