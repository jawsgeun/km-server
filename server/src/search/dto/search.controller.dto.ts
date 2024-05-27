import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { BLD } from 'src/common/enums';
import { FoodDataUtilizationStatus } from 'src/food-data/entities/food-data.entity';

class SearchResultResponseDto {
  @ApiProperty({ description: '음식 데이터 ID' })
  foodDataId: string;
  @ApiProperty({ description: '음식명' })
  name: string;
  @ApiProperty({ enum: BLD, description: '끼니' })
  bld: BLD;
  @ApiProperty({ enum: FoodDataUtilizationStatus, description: '활용 상태' })
  utilizationStatus: FoodDataUtilizationStatus;
  @ApiProperty({ description: '최근 일자, 형식: YYYYMMDD' })
  dateRecentServed: string;
}

export class SearchResponseDto {
  @ApiProperty()
  totalItemCount: number;
  @ApiProperty({ type: [SearchResultResponseDto] })
  resultList: SearchResultResponseDto[];
}

export class SearchRequestQueryDto {
  @ApiProperty({ description: '검색 내용' })
  @Length(1, 20)
  keyword: string;
}
