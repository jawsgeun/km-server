import { Controller, Get, Query, Session, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import {
  GetWeeklyMenuListRequestQueryDto,
  GetWeeklyMenuListResponseDto,
} from '../dto/weekly-menu.controller.dto';
import { WeeklyMenuService } from '../services/weekly-menu.service';

@Controller('weekly-menu')
export class WeeklyMenuController {
  constructor(private readonly weeklyMenuService: WeeklyMenuService) {}
  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '주간 조리 식단과 메뉴 아이템 잔식량의 목록을 반환한다',
  })
  @ApiOkResponse({ type: GetWeeklyMenuListResponseDto })
  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query() query: GetWeeklyMenuListRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<GetWeeklyMenuListResponseDto> {
    const weeklyMenuList = await this.weeklyMenuService.getWeeklyMenuList({
      bld: query.bld,
      dateFromYYYYMMDD: query.dateFrom,
      dateToYYYYMMDD: query.dateTo,
      operationBranchId: Number(session.LoggedInBranch.id),
    });

    return {
      data: weeklyMenuList,
    };
  }
}
