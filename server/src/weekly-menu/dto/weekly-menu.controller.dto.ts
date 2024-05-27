import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsGte, IsYYYYMMDD } from 'src/common/decorators';
import { BLD } from 'src/common/enums';
import { type MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { type Menu } from 'src/menu/entities/menu.entity';

class WeeklyMenuItemResponseDto {
  @ApiProperty({ description: '주간 메뉴 아이템 ID' })
  id: string;
  @ApiProperty({
    description: '메뉴명',
    examples: ['김치찌개', '육개장수제비'],
  })
  name: string;
  @ApiProperty({ description: '잔식량(단위: g)' })
  remainingFoodAmount: number;
  @ApiProperty({ description: '잔식금액(단위: 원)' })
  remainingPriceAmount: number;
  static of(menuItem: MenuItem): WeeklyMenuItemResponseDto {
    return {
      id: String(menuItem.id),
      name: menuItem.name,
      remainingFoodAmount: menuItem.totalRemainingFoodAmount,
      remainingPriceAmount: menuItem.totalRemainingPriceAmount,
    };
  }
}

export class WeeklyMenuResponseDto {
  @ApiProperty({ description: '제공 날짜, 형식: YYYYMMDD' })
  dateServed: string;
  @ApiProperty({ description: '예상 식수' })
  expectedCoverCount: number;
  @ApiProperty({ type: Number, nullable: true, description: '실제 식수' })
  actualCoverCount: number | null;
  @ApiProperty({ description: '코너 명', examples: ['중식A', '중식B'] })
  cornerName: string;
  @ApiProperty({ type: [WeeklyMenuItemResponseDto] })
  menuItemList: WeeklyMenuItemResponseDto[];

  static of(menu: Menu): WeeklyMenuResponseDto {
    return {
      dateServed: String(menu.dateServed),
      expectedCoverCount: menu.expectedCoverCount,
      actualCoverCount: menu.actualCoverCount,
      cornerName: menu.name,
      menuItemList: menu.menuItemList.map(WeeklyMenuItemResponseDto.of),
    };
  }
}

export class GetWeeklyMenuListResponseDto {
  @ApiProperty({
    type: [WeeklyMenuResponseDto],
    description: '주간 조리 식단',
  })
  data: WeeklyMenuResponseDto[];
}

export class GetWeeklyMenuListRequestQueryDto {
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
}
