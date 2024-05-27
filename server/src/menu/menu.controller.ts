import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import { MenuService } from './menu.service';
import {
  GetMenuListRequestQueryDto,
  GetMenuListResponseDto,
  PatchMenuRequestBodyDto,
  PatchMenuResponseDto,
  UpdateMenuRequestBodyDto,
  UpdateMenuResponseDto,
} from './dto/menu.controller.dto';
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
  @ApiExcludeEndpoint()
  @Get()
  async findAll(
    @Query() query: GetMenuListRequestQueryDto,
  ): Promise<GetMenuListResponseDto> {
    const menuList = await this.menuService.getMenuList({
      dateFromYYYYMMDD: query.dateFrom,
      dateToYYYYMMDD: query.dateTo,
      operationBranchId: Number(query.operationBranchId),
    });

    return {
      data: menuList,
    };
  }

  @ApiExcludeEndpoint()
  @Post(':id')
  async updateMenu(
    @Param('id') menuId: string,
    @Body() dto: UpdateMenuRequestBodyDto,
  ): Promise<UpdateMenuResponseDto> {
    await this.menuService.updateMenu({
      menuId: Number(menuId),
      order: dto.order,
      cornerName: dto.cornerName,
    });

    return {
      message: '메뉴의 순서 및 코너명이 정상적으로 변경 되었습니다',
    };
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  async patchMenu(
    @Param('id') menuId: string,
    @Body() dto: PatchMenuRequestBodyDto,
  ): Promise<PatchMenuResponseDto> {
    await this.menuService.update(Number(menuId), dto);

    return {
      message: '메뉴가 정상적으로 변경 되었습니다',
    };
  }
}
