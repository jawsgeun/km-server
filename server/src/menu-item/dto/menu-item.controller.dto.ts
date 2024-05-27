import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { isNil } from 'lodash';
import { IsYYYYMMDD } from 'src/common/decorators';
import { CommonPostResponse } from 'src/common/dto';
import { BLD } from 'src/common/enums';

export class UpdateMemoAndCoverCountRequestBodyDto {
  @ApiProperty({ type: String, description: '메모 내용', nullable: true })
  @ValidateIf(({ memo }) => !isNil(memo))
  memo?: string | null;

  @ApiProperty({
    type: Number,
    description: '조리 식수(단위: 명)',
    nullable: true,
  })
  @ValidateIf(({ editedCoverCount }) => !isNil(editedCoverCount))
  @Min(1)
  @Max(9999)
  editedCoverCount?: number | null;
}

export class UpdateMemoAndCoverCountResponseDto extends CommonPostResponse {
  @ApiProperty({ description: '메뉴 아이템 ID' })
  id: string;
}

export class UpdateMemoAndCoverCountRequestParamDto {
  @ApiProperty({ description: '메뉴 아이템 ID' })
  @Type(() => Number)
  @IsNumber()
  menuItemId: number;
}

export class GetMenuItemListRequestQueryDto {
  @IsYYYYMMDD()
  dateServedYYYYMMDD: string;
  @IsEnum(BLD)
  bld: BLD;
  @IsString()
  operationBranchId: string;
}

export class UpdateMenuItemRequestBodyDto {
  @IsBoolean()
  activated: boolean;
}

export class UpdateMenuItemRequestResponseDto extends CommonPostResponse {}
