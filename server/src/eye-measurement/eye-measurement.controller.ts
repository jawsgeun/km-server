import { Controller, Post, Body } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { EyeMeasurementService } from './eye-measurement.service';
import {
  ProcessEyeMeasurementRequestBodyDto,
  ProcessEyeMeasurementResponseDto,
} from './dto/eye-measurement.controller.dto';

@ApiExcludeController()
@Controller('eye-measurement')
export class EyeMeasurementController {
  constructor(private readonly eyeMeasurementService: EyeMeasurementService) {}

  @Post()
  async process(
    @Body() processEyeMeasurementDto: ProcessEyeMeasurementRequestBodyDto,
  ): Promise<ProcessEyeMeasurementResponseDto> {
    await this.eyeMeasurementService.processEyeMeasurement({
      volume: processEyeMeasurementDto.volume,
      rawMenuItemId: processEyeMeasurementDto.rawMenuItemId,
      rawFoodIngredientId: processEyeMeasurementDto.rawFoodIngredientId || null,
    });

    return {
      message: '목측 완료',
    };
  }
}
