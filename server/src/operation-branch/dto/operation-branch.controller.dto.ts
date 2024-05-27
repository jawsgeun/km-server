import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrTelNumber } from 'src/common/decorators';
import {
  IsEnum,
  IsNumber,
  IsNumberString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { CommonPostResponse } from 'src/common/dto';

import {
  CompanyName,
  type OperationBranch,
} from '../entities/operation-branch.entity';
import { OperationBranchManager } from '../entities/operation-branch-manager.entity';

export class RequestSendCodeRequestBodyDto {
  @ApiProperty({ description: '연락처, 이메일 또는 휴대전화' })
  @IsEmailOrTelNumber()
  contact: string;
}

export class RequestSendCodeResponseDto extends CommonPostResponse {}

export class LoggedInOperationBranchResponseDto {
  @ApiProperty({ description: '기관명' })
  name: string;

  static of(
    operationBranch: OperationBranch,
  ): LoggedInOperationBranchResponseDto {
    return {
      name: operationBranch.name,
    };
  }
}

export class OperationBranchManagerResponseDto {
  id: number;
  name: string;
  tel: string | null;
  telCountryCode: string | null;
  email: string | null;
  dateCreated: number;
  dateUpdated: number;
  static of(
    operationBranchManager: OperationBranchManager,
  ): OperationBranchManagerResponseDto {
    return {
      id: operationBranchManager.id,
      name: operationBranchManager.name,
      tel: operationBranchManager.tel,
      telCountryCode: operationBranchManager.telCountryCode,
      email: operationBranchManager.email,
      dateCreated: operationBranchManager.dateCreated.getTime(),
      dateUpdated: operationBranchManager.dateUpdated.getTime(),
    };
  }
}

export class OperationBranchResponseDto {
  id: number;
  companyName: CompanyName;
  name: string;
  code: string;
  loginCode: string;
  latitude: number;
  longitude: number;
  dateCreated: number;
  dateUpdated: number;
  managerList?: OperationBranchManagerResponseDto[];

  static of(operationBranch: OperationBranch): OperationBranchResponseDto {
    return {
      id: operationBranch.id,
      companyName: operationBranch.companyName,
      name: operationBranch.name,
      code: operationBranch.code,
      loginCode: operationBranch.loginCode,
      latitude: operationBranch.latitude,
      longitude: operationBranch.longitude,
      dateCreated: operationBranch.dateCreated.getTime(),
      dateUpdated: operationBranch.dateUpdated.getTime(),
      managerList:
        operationBranch.managerList &&
        operationBranch.managerList.map(OperationBranchManagerResponseDto.of),
    };
  }
}

export class GetOperationBranchListResponseDto {
  data: OperationBranchResponseDto[];
}

export class CreateOperationBranchResponseDto extends CommonPostResponse {}

export class CreateOperationBranchRequestBodyDto {
  @IsEnum(CompanyName)
  companyName: CompanyName;

  @Length(1)
  name: string;

  @Length(1)
  code: string;

  @Length(6, 6)
  @IsNumberString()
  loginCode: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
