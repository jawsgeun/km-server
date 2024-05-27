import { PartialType } from '@nestjs/mapped-types';

import { Menu } from '../entities/menu.entity';

export class GetMenuListDto {
  operationBranchId: number;
  dateFromYYYYMMDD: string;
  dateToYYYYMMDD: string;
}

export class UpdateMenuDto {
  menuId: number;
  order: number;
  cornerName: string;
}

export class UpdateMenuEntityDto extends PartialType(Menu) {}
