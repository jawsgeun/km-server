import { IsNumber, IsOptional, Min } from 'class-validator';
import { CommonPostResponse } from 'src/common/dto';

export class ProcessEyeMeasurementRequestBodyDto {
  @IsNumber()
  @Min(1)
  volume: number;
  @IsNumber()
  rawMenuItemId: number;
  @IsOptional()
  @IsNumber()
  rawFoodIngredientId?: number | null;
}
export class ProcessEyeMeasurementResponseDto extends CommonPostResponse {}
