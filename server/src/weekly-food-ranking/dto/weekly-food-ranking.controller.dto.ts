import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsGte, IsYYYYMMDD } from 'src/common/decorators';
import { BLD } from 'src/common/enums';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';

export enum WeeklyFoodRankingOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetWeeklyFoodRankingDto {
  order: WeeklyFoodRankingOrder;
  bld: BLD;
  dateFromYYYYMMDD: string;
  dateToYYYYMMDD: string;
  operationBranchId: number;
}

export class GetWeeklyFoodRankingRequestQueryDto {
  @ApiProperty({ enum: BLD, description: 'B: 조식, L: 중식, D: 석식' })
  @IsEnum(BLD)
  bld: BLD;

  @ApiProperty({
    enum: WeeklyFoodRankingOrder,
    description: '잔식 많은 순, 잔식 적은 순',
  })
  @IsEnum(WeeklyFoodRankingOrder)
  order: WeeklyFoodRankingOrder;

  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  dateFrom: string;

  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  @IsGte('dateFrom')
  dateTo: string;
}

export class WeeklyFoodRankingResponseDto {
  @ApiProperty({ description: '음식명' })
  name: string;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;

  static of(menuItem: MenuItem): WeeklyFoodRankingResponseDto {
    return {
      name: menuItem.name,
      remainingFoodAmount: menuItem.totalRemainingFoodAmount,
    };
  }
}

export class GetWeeklyFoodRankingListResponseDto {
  @ApiProperty({
    type: [WeeklyFoodRankingResponseDto],
    description: '주간 잔식 랭킹',
  })
  data: WeeklyFoodRankingResponseDto[];
}
