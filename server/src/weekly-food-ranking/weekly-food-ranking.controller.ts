import { Controller, Get, Query, Session, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import {
  GetWeeklyFoodRankingRequestQueryDto,
  GetWeeklyFoodRankingListResponseDto,
} from './dto/weekly-food-ranking.controller.dto';
import { WeeklyFoodRankingService } from './weekly-food-ranking.service';

@Controller('weekly-food-ranking')
export class WeeklyFoodRankingController {
  constructor(
    private readonly weeklyFoodRankingService: WeeklyFoodRankingService,
  ) {}
  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '주간 잔식량이 적었던/많았던 음식 3개를 반환한다',
  })
  @ApiOkResponse({
    type: GetWeeklyFoodRankingListResponseDto,
  })
  @UseGuards(AuthGuard)
  @Get()
  async getWeeklyFoodRanking(
    @Query() query: GetWeeklyFoodRankingRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<GetWeeklyFoodRankingListResponseDto> {
    const weeklyFoodRankingList =
      await this.weeklyFoodRankingService.getWeeklyFoodRanking({
        operationBranchId: Number(session.LoggedInBranch.id),
        bld: query.bld,
        dateFromYYYYMMDD: query.dateFrom,
        dateToYYYYMMDD: query.dateTo,
        order: query.order,
      });

    return {
      data: weeklyFoodRankingList,
    };
  }
}
