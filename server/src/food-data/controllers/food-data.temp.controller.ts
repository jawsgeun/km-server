import { Body, Controller, Post } from '@nestjs/common';
import { CommonPostResponse } from 'src/common/dto';

import { FoodDataManualService } from '../services/food-data-manual.service';

interface UpdateFoodDataRecentServedCornerNameRequestBodyDto {
  inputList: Array<{
    foodDataId: string;
    recentServedCornerName: string;
  }>;
}

@Controller('food-data/temp')
export class FoodDataTempController {
  constructor(private readonly foodDataManualService: FoodDataManualService) {}

  @Post('recent-served-corner-name')
  async updateFoodDataRecentServedCornerName(
    @Body() dto: UpdateFoodDataRecentServedCornerNameRequestBodyDto,
  ): Promise<CommonPostResponse> {
    await this.foodDataManualService.updateFoodDataRecentServedCornerName(
      dto.inputList.map((item) => ({
        ...item,
        foodDataId: Number(item.foodDataId),
      })),
    );
    return {
      message: '음식 데이터의 최근 제공 코너명을 업데이트했습니다.',
    };
  }
}
