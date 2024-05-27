import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { PaginationResponseDto } from 'src/common/dto';
import { BLD } from 'src/common/enums';

import { MealServiceResultType } from './meal-service-result.service.dto';

export enum ServingSizeProperLevel {
  PROPER = 'PROPER',
  NEED_MODIFY = 'NEED_MODIFY',
}

class CommonMealServiceDto {
  @ApiProperty({ description: 'ID' })
  id: string;
  @ApiProperty({ description: '음식명' })
  name: string;
  @ApiProperty({ description: '제공일자' })
  dateServed: number;
  @ApiProperty({ description: '코너명' })
  cornerName: string;
  @ApiProperty({
    enum: ServingSizeProperLevel,
    description: '1인량 적정성',
  })
  servingSizeProperLevel: ServingSizeProperLevel;
  @ApiProperty({ description: '레시피 1인량' })
  servingSize: number;
  @ApiProperty({ type: Number, nullable: true, description: '제안 1인량' })
  servingSizeSuggestion: number | null;
  @ApiProperty({ type: Number, nullable: true, description: '1인량 감축량' })
  servingSizeReduction: number | null;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;
  @ApiProperty({ description: '예상 식수(단위: 명)' })
  expectedCoverCount: number;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: '실제 식수(단위: 명)',
  })
  actualCoverCount: number | null;
  @ApiProperty({ description: '메모 유무' })
  hasMemo: boolean;
}

export class MealServiceFoodIngredientResponseDto extends CommonMealServiceDto {
  @ApiProperty({ description: '식재료 ID' })
  id: string;
}

export class MealServiceMenuItemResponseDto extends CommonMealServiceDto {
  @ApiProperty({ description: '메뉴 아이템 ID' })
  id: string;
  @ApiProperty({ type: [MealServiceFoodIngredientResponseDto] })
  foodIngredientList: Array<MealServiceFoodIngredientResponseDto>;
}

export class GetMealServiceResultListResponseDto {
  @ApiProperty({
    type: [MealServiceMenuItemResponseDto],
    description: '급식 결과 분석',
  })
  data: MealServiceMenuItemResponseDto[];
  @ApiProperty()
  pagination: PaginationResponseDto;
}

class MealServiceDetailMemoResponseDto {
  @ApiProperty({ description: '메모 내용' })
  content: string;
  @ApiProperty({ description: '작성 날짜, 형식: YYYYMMDD' })
  dateCreated: string;
}

class MealServiceDetailSiblingMenuItemResponseDto {
  @ApiProperty({
    description: '메뉴명',
    examples: ['김치찌개', '육개장수제비'],
  })
  name: string;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;
}

export class MealServiceDetailSiblingMenuResponseDto {
  @ApiProperty({ description: '코너명' })
  cornerName: string;
  @ApiProperty({ type: [MealServiceDetailSiblingMenuItemResponseDto] })
  menuItemList: MealServiceDetailSiblingMenuItemResponseDto[];
}

export class MealServiceResultDetailResponseDto {
  @ApiProperty({ description: '음식명' })
  name: string;
  @ApiProperty({ enum: BLD, description: '끼니' })
  bld: BLD;
  @ApiProperty({ description: '제공일자' })
  dateServed: number;
  @ApiProperty({ description: '날씨 아이콘' })
  weatherIcon: string;
  @ApiProperty({ description: '코너명' })
  cornerName: string;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;
  @ApiProperty({ description: '예상 식수' })
  expectedCoverCount: number;
  @ApiProperty({ type: Number, nullable: true, description: '실제 식수' })
  actualCoverCount: number | null;
  @ApiProperty({ type: MealServiceDetailMemoResponseDto, nullable: true })
  memo: MealServiceDetailMemoResponseDto | null;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: '조리 식수(단위: 명)',
  })
  editedCoverCount: number | null;
  @ApiProperty({ type: [MealServiceDetailSiblingMenuResponseDto] })
  siblingMenuList: MealServiceDetailSiblingMenuResponseDto[];
}

export class GetMealServiceResultListRequestParamDto {
  @ApiProperty({ name: 'foodDataId', description: '음식 데이터 ID' })
  @Type(() => Number)
  @IsNumber()
  foodDataId: number;
}

export class GetMealServiceResultListRequestQueryDto {
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

export class GetMealServiceResultDetailRequestParamDto {
  @ApiProperty({ name: 'foodDataId', description: '음식 데이터 ID' })
  @Type(() => Number)
  @IsNumber()
  foodDataId: number;

  @ApiProperty({ name: 'mealServiceResultId', description: '급식 결과 ID' })
  @Type(() => Number)
  @IsNumber()
  mealServiceResultId: number;
}

export class GetMealServiceResultDetailRequestQueryDto {
  @ApiProperty({ enum: MealServiceResultType, description: '급식 결과 타입' })
  @IsEnum(MealServiceResultType)
  type: MealServiceResultType;
}
