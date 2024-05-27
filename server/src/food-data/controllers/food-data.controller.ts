import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { LoggedInSessionType, convertToPaginationDto } from 'src/common/dto';
import { AuthGuard } from 'src/auth/auth.guard';

import { FoodDataService } from '../services/food-data.service';
import {
  FoodDataResponseDto,
  GetFoodDataListResponseDto,
  GetFoodListRequestQueryDto,
  GetFoodRequestParamDto,
  UpdateFoodDataUtilizationStatusRequestBodyDto,
  UpdateFoodDataUtilizationStatusRequestParamDto,
  UpdateFoodDataUtilizationStatusResponseDto,
} from '../dto/food-data.controller.dto';

@Controller('food-data')
export class FoodDataController {
  constructor(private readonly foodDataService: FoodDataService) {}

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '음식 데이터 목록을 반환한다' })
  @ApiOkResponse({ type: GetFoodDataListResponseDto })
  @UseGuards(AuthGuard)
  @Get()
  async getFoodDataList(
    @Query() query: GetFoodListRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<GetFoodDataListResponseDto> {
    const args = {
      bld: query.bld,
      dateFromYYYYMMDD: query.dateFrom,
      dateToYYYYMMDD: query.dateTo,
      page: query.page,
      sizePerPage: query.sizePerPage,
      dateRecentServedOrder: query.dateRecentServedOrder,
      operationBranchId: session.LoggedInBranch.id,
    };

    const foodDataList = await this.foodDataService.getFoodDataList(args);
    const totalCount =
      await this.foodDataService.getFoodDataListTotalCount(args);

    return {
      data: foodDataList,
      pagination: convertToPaginationDto(
        totalCount,
        args.page,
        args.sizePerPage,
      ),
    };
  }

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '음식 데이터를 반환한다' })
  @ApiOkResponse({ type: FoodDataResponseDto })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(
    @Param() param: GetFoodRequestParamDto,
    @Session() session: LoggedInSessionType,
  ): Promise<FoodDataResponseDto> {
    await this.foodDataService.validateOperationBranchFoodData(
      param.id,
      Number(session.LoggedInBranch.id),
    );
    return this.foodDataService.getFoodData(param.id);
  }

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({ description: '음식 데이터의 활용 상태를 변경한다' })
  @ApiOkResponse({ type: UpdateFoodDataUtilizationStatusResponseDto })
  @UseGuards(AuthGuard)
  @Post(':foodDataId/status')
  async updateStatus(
    @Param() param: UpdateFoodDataUtilizationStatusRequestParamDto,
    @Body() dto: UpdateFoodDataUtilizationStatusRequestBodyDto,
    @Session() session: LoggedInSessionType,
  ): Promise<UpdateFoodDataUtilizationStatusResponseDto> {
    await this.foodDataService.validateOperationBranchFoodData(
      param.foodDataId,
      Number(session.LoggedInBranch.id),
    );
    const foodData = await this.foodDataService.updateFoodDataUtilizationStatus(
      param.foodDataId,
      dto.utilizationStatus,
    );
    return {
      message: '음식 데이터 활용 상태가 정상적으로 변경 되었습니다',
      id: String(foodData.id),
      newUtilizationStatus: foodData.utilizationStatus,
    };
  }
}
