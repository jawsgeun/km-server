import {
  Controller,
  Get,
  Body,
  Param,
  Query,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import { MenuItemService } from './menu-item.service';
import {
  GetMenuItemListRequestQueryDto,
  UpdateMemoAndCoverCountRequestBodyDto,
  UpdateMemoAndCoverCountRequestParamDto,
  UpdateMemoAndCoverCountResponseDto,
  UpdateMenuItemRequestBodyDto,
  UpdateMenuItemRequestResponseDto,
} from './dto/menu-item.controller.dto';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}
  @ApiExcludeEndpoint()
  @Get()
  findAll(@Query() query: GetMenuItemListRequestQueryDto) {
    return this.menuItemService.findAll({
      operationBranchId: Number(query.operationBranchId),
      dateServed: Number(query.dateServedYYYYMMDD),
      bld: query.bld,
    });
  }

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '특정 메뉴 아이템의 메모 및 조리식수를 변경한다',
  })
  @ApiOkResponse({ type: UpdateMemoAndCoverCountResponseDto })
  @UseGuards(AuthGuard)
  @Post(':menuItemId/memo-and-cover-count')
  async updateMemoAndCoverCount(
    @Param() param: UpdateMemoAndCoverCountRequestParamDto,
    @Body() dto: UpdateMemoAndCoverCountRequestBodyDto,
    @Session() session: LoggedInSessionType,
  ): Promise<UpdateMemoAndCoverCountResponseDto> {
    await this.menuItemService.validateOperationBranchMenuItem(
      param.menuItemId,
      Number(session.LoggedInBranch.id),
    );

    const menuItem = await this.menuItemService.updateMemoAndCoverCount(
      param.menuItemId,
      dto,
    );
    return {
      message: '메뉴 아이템의 메모 및 조리식수가 정상적으로 변경 되었습니다',
      id: String(menuItem.id),
    };
  }

  @ApiExcludeEndpoint()
  @Post(':id')
  async updateMenuItem(
    @Param('id') menuItemId: string,
    @Body() dto: UpdateMenuItemRequestBodyDto,
  ): Promise<UpdateMenuItemRequestResponseDto> {
    await this.menuItemService.updateMenuItem({
      menuItemId: Number(menuItemId),
      activated: dto.activated,
    });

    return {
      message: '메뉴 아이템의 활성 상태가 정상적으로 변경 되었습니다',
    };
  }
}
