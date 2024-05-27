import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { type FoodData } from 'src/food-data/entities/food-data.entity';
import { type FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';

type FoodDataWithSibling = FoodData & { siblingMenuItemName?: string };
type MenuItemWithFoodData = MenuItem & { foodData?: FoodDataWithSibling };

class WeeklyMenuItemDetailSummaryResponseDto {
  @ApiProperty({ description: '음식 데이터 ID' })
  foodDataId: string;
  @ApiProperty({ type: Number, nullable: true, description: '평균 식수' })
  coverCountAverage: number | null;
  @ApiProperty({ type: Number, nullable: true, description: '최고 식수' })
  maxCoverCount: number | null;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: '함께 제공한 음식명',
    examples: ['삼겹살', '오겹살'],
  })
  siblingMenuItemName: string | null;

  static of(
    foodData: FoodDataWithSibling,
  ): WeeklyMenuItemDetailSummaryResponseDto {
    const { totalMenuItemCount, totalActualCoverCount } = foodData;
    const coverCountAverage = totalMenuItemCount
      ? Math.round(totalActualCoverCount / totalMenuItemCount)
      : null;

    return {
      foodDataId: String(foodData.id),
      coverCountAverage,
      maxCoverCount:
        foodData.maxCoverCount === 0 ? null : foodData.maxCoverCount,
      siblingMenuItemName: foodData.siblingMenuItemName || null,
    };
  }
}

class WeeklyMenuItemDetailRemainingFoodResponseDto {
  @ApiProperty({
    description: '메뉴명',
    examples: ['김치찌개', '김치찌개(돼지고기)', '김치찌개(김치)'],
  })
  name: string;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;
  @ApiProperty({ description: '잔식금액(단위: 원)' })
  remainingPriceAmount: number;

  static of(
    foodIngredient: FoodIngredient,
    menuItemName: string,
  ): WeeklyMenuItemDetailRemainingFoodResponseDto {
    return {
      name: `${menuItemName}(${foodIngredient.name})`,
      remainingFoodAmount: foodIngredient.remainingFoodAmount,
      remainingPriceAmount: foodIngredient.remainingPriceAmount,
    };
  }
}

export class WeeklyMenuItemDetailResponseDto {
  @ApiProperty({ description: '주간 메뉴 아이템 ID' })
  id: string;
  @ApiProperty({
    description: '메뉴명',
    examples: ['김치찌개', '육개장수제비'],
  })
  name: string;
  @ApiProperty({ description: '제공 날짜, 형식: YYYYMMDD' })
  dateServed: string;
  @ApiProperty({ description: '코너 명', examples: ['중식A', '중식B'] })
  cornerName: string;
  @ApiProperty({ type: [WeeklyMenuItemDetailRemainingFoodResponseDto] })
  remainingFoodList: WeeklyMenuItemDetailRemainingFoodResponseDto[];
  @ApiProperty({ description: '메모 내용' })
  memo: string;
  @ApiProperty({
    type: Number,
    nullable: true,
    description: '조리 식수(단위: 명)',
  })
  editedCoverCount: number | null;
  @ApiProperty({ type: WeeklyMenuItemDetailSummaryResponseDto, nullable: true })
  summary: WeeklyMenuItemDetailSummaryResponseDto | null;

  static of(menuItem: MenuItemWithFoodData): WeeklyMenuItemDetailResponseDto {
    const [memo] = menuItem.memoList;

    const remainingMenuItem = {
      name: menuItem.name,
      remainingFoodAmount: menuItem.remainingFoodAmount,
      remainingPriceAmount: menuItem.remainingPriceAmount,
    };

    return {
      id: String(menuItem.id),
      name: menuItem.name,
      dateServed: String(menuItem.menu.dateServed),
      cornerName: menuItem.menu.name,
      remainingFoodList: [
        remainingMenuItem,
        ...menuItem.foodIngredientList.map((foodIngredient) =>
          WeeklyMenuItemDetailRemainingFoodResponseDto.of(
            foodIngredient,
            menuItem.name,
          ),
        ),
      ],
      memo: memo ? memo.content : '',
      editedCoverCount: menuItem.menu.editedCoverCount,
      summary: menuItem.foodData
        ? WeeklyMenuItemDetailSummaryResponseDto.of(menuItem.foodData)
        : null,
    };
  }
}

export class GetWeeklyMenuItemRequestParamDto {
  @ApiProperty({ description: '주간 메뉴 아이템 ID' })
  @Type(() => Number)
  @IsNumber()
  id: number;
}
