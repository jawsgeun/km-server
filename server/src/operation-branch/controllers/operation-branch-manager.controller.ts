import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import {
  CreateOperationBranchManagerRequestBodyDto,
  CreateOperationBranchManagerResponseDto,
} from '../dto/operation-branch-manager.controller.dto';
import { OperationBranchManagerService } from '../services/operation-branch-manager.service';

@Controller('operation-branch/:operationBranchId/manager')
export class OperationBranchManagerController {
  constructor(
    private readonly operationBranchManagerService: OperationBranchManagerService,
  ) {}
  @ApiExcludeEndpoint()
  @Post()
  async createOperationBranchManager(
    @Param('operationBranchId') operationBranchId: number,
    @Body() dto: CreateOperationBranchManagerRequestBodyDto,
  ): Promise<CreateOperationBranchManagerResponseDto> {
    await this.operationBranchManagerService.createOperationBranchManager({
      operationBranchId,
      name: dto.name,
      tel: dto.tel || null,
      telCountryCode: dto.telCountryCode || null,
      email: dto.email || null,
    });
    return {
      message: '기관 매니저 생성 완료',
    };
  }
}
