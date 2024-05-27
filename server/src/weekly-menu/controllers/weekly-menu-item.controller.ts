import { Controller, Get, Param, Session, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { MenuItemService } from 'src/menu-item/menu-item.service';
import { AuthGuard } from 'src/auth/auth.guard';

import {
  GetWeeklyMenuItemRequestParamDto,
  WeeklyMenuItemDetailResponseDto,
} from '../dto/weekly-menu-item.controller.dto';
import { WeeklyMenuItemService } from '../services/weekly-menu-item.service';

@Controller('weekly-menu-item')
export class WeeklyMenuItemController {
  constructor(
    private readonly weeklyMenuItemService: WeeklyMenuItemService,
    private readonly menuItemService: MenuItemService,
  ) {}

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '특정 메뉴 아이템의 상세정보를 반환한다' })
  @ApiOkResponse({ type: WeeklyMenuItemDetailResponseDto })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param() param: GetWeeklyMenuItemRequestParamDto,
    @Session() session: LoggedInSessionType,
  ): Promise<WeeklyMenuItemDetailResponseDto> {
    await this.menuItemService.validateOperationBranchMenuItem(
      param.id,
      Number(session.LoggedInBranch.id),
    );
    return this.weeklyMenuItemService.getWeeklyMenuItem(param.id);
  }
}
