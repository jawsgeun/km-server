import { IsGte, IsYYYYMMDD } from 'src/common/decorators';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { BLD } from 'src/common/enums';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CommonPostResponse } from 'src/common/dto';

import { type Menu } from '../entities/menu.entity';

export class GetMenuListRequestQueryDto {
  @IsString()
  operationBranchId: string;

  @IsYYYYMMDD()
  dateFrom: string;

  @IsYYYYMMDD()
  @IsGte('dateFrom')
  dateTo: string;
}

class MenuItemResponseDto {
  id: string;
  name: string;
  activated: boolean;
  static of(menuItem: MenuItem): MenuItemResponseDto {
    return {
      id: String(menuItem.id),
      name: menuItem.name,
      activated: menuItem.activated,
    };
  }
}

export class MenuResponseDto {
  id: string;
  dateServed: string;
  bld: BLD;
  order: number;
  cornerName: string;
  expectedCoverCount: number;
  actualCoverCount: number | null;
  menuItemList: MenuItemResponseDto[];

  static of(menu: Menu): MenuResponseDto {
    return {
      id: String(menu.id),
      dateServed: String(menu.dateServed),
      bld: menu.bld,
      order: menu.order,
      cornerName: menu.name,
      actualCoverCount: menu.actualCoverCount,
      expectedCoverCount: menu.expectedCoverCount,
      menuItemList: menu.menuItemList.map(MenuItemResponseDto.of),
    };
  }
}

export class GetMenuListResponseDto {
  data: MenuResponseDto[];
}

export class UpdateMenuRequestBodyDto {
  @IsNumber()
  order: number;
  @IsString()
  cornerName: string;
}

export class UpdateMenuResponseDto extends CommonPostResponse {}

export class PatchMenuRequestBodyDto {
  @IsOptional()
  @IsNumber()
  actualCoverCount?: number | null;
}

export class PatchMenuResponseDto extends CommonPostResponse {}
