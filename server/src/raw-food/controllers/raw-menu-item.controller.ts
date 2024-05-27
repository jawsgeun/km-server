import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { RawMenuItemService } from '../services/raw-menu-item.service';
import {
  GetRawMenuItemListRequestQueryDto,
  RawMenuItemDto,
} from '../dto/raw-menu-item.controller.dto';

@ApiExcludeController()
@Controller('raw-menu-item')
export class RawMenuItemController {
  constructor(private readonly rawMenuItemService: RawMenuItemService) {}
  @Get()
  async findAll(@Query() query: GetRawMenuItemListRequestQueryDto) {
    const rawMenuItemList = await this.rawMenuItemService.findAll({
      operationBranchId: Number(query.operationBranchId),
      dateServed: Number(query.dateServedYYYYMMDD),
      bld: query.bld,
    });

    return rawMenuItemList.map(
      (rawMenuItem) => new RawMenuItemDto(rawMenuItem),
    );
  }
}
