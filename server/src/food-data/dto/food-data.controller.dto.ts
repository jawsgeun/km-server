import { ApiProperty } from '@nestjs/swagger';
import { CommonPostResponse, PaginationResponseDto } from 'src/common/dto';
import { BLD } from 'src/common/enums';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsGte, IsYYYYMMDD } from 'src/common/decorators';

import {
  type FoodData,
  FoodDataUtilizationStatus,
} from '../entities/food-data.entity';

type FoodDataWithSibling = FoodData & { siblingMenuItemName?: string };

export enum FoodDataDateRecentServedOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FoodDataResponseDto {
  @ApiProperty({ description: '음식 데이터 ID' })
  id: string;
  @ApiProperty({ description: '음식명' })
  name: string;
  @ApiProperty({ enum: BLD, description: '끼니' })
  bld: BLD;
  @ApiProperty({ description: '최근 제공한 코너명' })
  recentServedCornerName: string;
  @ApiProperty({ description: '최근 일자' })
  dateRecentServed: number;
  @ApiProperty({ type: Number, description: '제공 횟수' })
  servingCount: number;
  @ApiProperty({ type: Number, nullable: true, description: '평균 식수' })
  coverCountAverage: number | null;
  @ApiProperty({ type: Number, nullable: true, description: '최고 식수' })
  maxCoverCount: number | null;
  @ApiProperty({
    type: String,
    nullable: true,
    description: '최고 식수 식단에 함께 제공한 음식',
  })
  siblingMenuItemName: string | null;
  @ApiProperty({ description: '메모 유무' })
  hasMemo: boolean;
  @ApiProperty({ enum: FoodDataUtilizationStatus, description: '활용 상태' })
  utilizationStatus: FoodDataUtilizationStatus;

  static of(foodData: FoodDataWithSibling): FoodDataResponseDto {
    const { totalActualCoverCount, totalMenuItemCount } = foodData;
    const coverCountAverage = totalMenuItemCount
      ? Math.round(totalActualCoverCount / totalMenuItemCount)
      : null;

    return {
      id: String(foodData.id),
      name: foodData.name,
      bld: foodData.bld,
      recentServedCornerName: foodData.recentServedCornerName,
      dateRecentServed: foodData.dateRecentServed,
      servingCount: foodData.servingCount,
      coverCountAverage,
      maxCoverCount:
        foodData.maxCoverCount === 0 ? null : foodData.maxCoverCount,
      siblingMenuItemName: foodData.siblingMenuItemName || null,
      hasMemo: foodData.hasMemo,
      utilizationStatus: foodData.utilizationStatus,
    };
  }
}

export class GetFoodDataListResponseDto {
  @ApiProperty({ type: [FoodDataResponseDto], description: '음식 데이터' })
  data: FoodDataResponseDto[];
  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class UpdateFoodDataUtilizationStatusResponseDto extends CommonPostResponse {
  @ApiProperty({ description: '음식 데이터 ID' })
  id: string;
  @ApiProperty({ description: '변경 후 활용 상태' })
  newUtilizationStatus: FoodDataUtilizationStatus;
}

export class GetFoodListRequestQueryDto {
  @ApiProperty({ enum: BLD, description: 'B: 조식, L: 중식, D: 석식' })
  @IsEnum(BLD)
  bld: BLD;

  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  dateFrom: string;

  @ApiProperty({ description: '형식: YYYYMMDD, 예시: 20231222' })
  @IsYYYYMMDD()
  @IsGte('dateFrom')
  dateTo: string;

  @ApiProperty({
    enum: FoodDataDateRecentServedOrder,
    description: '최근 제공 일자 정렬',
  })
  @IsEnum(FoodDataDateRecentServedOrder)
  dateRecentServedOrder: FoodDataDateRecentServedOrder;

  @ApiProperty({ description: '페이지 번호 (1부터 시작)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ description: '페이지에 표시할 아이템 개수' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  sizePerPage: number;
}

export class GetFoodRequestParamDto {
  @ApiProperty({ description: '음식 데이터 ID' })
  @Type(() => Number)
  @IsNumber()
  id: number;
}

export class UpdateFoodDataUtilizationStatusRequestParamDto {
  @ApiProperty({ name: 'foodDataId', description: '음식 데이터 ID' })
  @Type(() => Number)
  @IsNumber()
  foodDataId: number;
}

export class UpdateFoodDataUtilizationStatusRequestBodyDto {
  @ApiProperty({
    enum: FoodDataUtilizationStatus,
    description: '변경 할 활용 상태',
  })
  @IsEnum(FoodDataUtilizationStatus)
  utilizationStatus: FoodDataUtilizationStatus;
}
