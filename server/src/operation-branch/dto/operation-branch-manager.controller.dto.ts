import { IsEmail, IsNumberString, IsOptional, Length } from 'class-validator';
import { CommonPostResponse } from 'src/common/dto';

export class CreateOperationBranchManagerResponseDto extends CommonPostResponse {}

export class CreateOperationBranchManagerRequestBodyDto {
  @Length(1)
  name: string;

  @IsOptional()
  @IsNumberString()
  tel?: string | null;

  @IsOptional()
  @IsNumberString()
  telCountryCode?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;
}
