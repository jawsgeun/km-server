import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import {
  GetMealServiceResultDetailRequestParamDto,
  GetMealServiceResultDetailRequestQueryDto,
  GetMealServiceResultListRequestParamDto,
  GetMealServiceResultListRequestQueryDto,
  GetMealServiceResultListResponseDto,
  MealServiceResultDetailResponseDto,
} from '../dto/meal-service-result.controller.dto';
import { MealServiceResultService } from '../services/meal-service-result.service';
import { FoodDataService } from '../services/food-data.service';

@Controller('food-data/:foodDataId/meal-service-result')
export class MealServiceResultController {
  constructor(
    private readonly mealServiceResultService: MealServiceResultService,
    private readonly foodDataService: FoodDataService,
  ) {}
  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '음식 데이터의 급식 결과 분석 목록을 반환한다' })
  @ApiOkResponse({ type: GetMealServiceResultListResponseDto })
  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Param() param: GetMealServiceResultListRequestParamDto,
    @Query() query: GetMealServiceResultListRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<GetMealServiceResultListResponseDto> {
    //TODO: 에러가 아닌 빈목록 반환하도록
    await this.foodDataService.validateOperationBranchFoodData(
      param.foodDataId,
      Number(session.LoggedInBranch.id),
    );

    return this.mealServiceResultService.getMealServiceResultList({
      foodDataId: param.foodDataId,
      page: query.page,
      sizePerPage: query.sizePerPage,
    });
  }

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '음식 데이터의 급식 결과 상세 정보를 반환한다' })
  @ApiOkResponse({ type: MealServiceResultDetailResponseDto })
  @UseGuards(AuthGuard)
  @Get(':mealServiceResultId')
  async find(
    @Param() param: GetMealServiceResultDetailRequestParamDto,
    @Query() query: GetMealServiceResultDetailRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<MealServiceResultDetailResponseDto> {
    //TODO: 에러가 아닌 빈목록 반환하도록
    await this.foodDataService.validateOperationBranchFoodData(
      param.foodDataId,
      Number(session.LoggedInBranch.id),
    );

    return this.mealServiceResultService.getMealServiceResultDetail({
      operationBranchId: Number(session.LoggedInBranch.id),
      mealServiceResultId: param.mealServiceResultId,
      type: query.type,
    });
  }
}
