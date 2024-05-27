import { Controller, Get, UseGuards, Query, Session } from '@nestjs/common';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoggedInSessionType } from 'src/common/dto';

import { WeatherService } from './weather.service';
import {
  GetWeatherListRequestQueryDto,
  GetWeatherListResponseDto,
} from './dto/weather.controller.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '조건에 해당하는 날씨 정보를 제공한다',
  })
  @ApiOkResponse({ type: GetWeatherListResponseDto })
  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Query() query: GetWeatherListRequestQueryDto,
    @Session() session: LoggedInSessionType,
  ): Promise<GetWeatherListResponseDto> {
    const weatherList = await this.weatherService.findAll({
      operationBranchId: Number(session.LoggedInBranch.id),
      dateFromYYYYMMDD: Number(query.dateFrom),
      dateToYYYYMMDD: Number(query.dateTo),
      bld: query.bld,
    });

    return {
      data: weatherList,
    };
  }
}
