import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Length } from 'class-validator';
import { CommonPostResponse } from 'src/common/dto';

export class LoginRequestDto {
  @ApiProperty({ description: '기관 코드' })
  @Length(6, 6)
  @IsNumberString()
  departmentCode: string;
}

export class LoginResponseDto extends CommonPostResponse {}
export class LooutResponseDto extends CommonPostResponse {}
