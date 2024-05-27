import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoggedInSessionType } from 'src/common/dto';

import {
  CreateOperationBranchRequestBodyDto,
  CreateOperationBranchResponseDto,
  GetOperationBranchListResponseDto,
  LoggedInOperationBranchResponseDto,
  OperationBranchResponseDto,
  RequestSendCodeRequestBodyDto,
  RequestSendCodeResponseDto,
} from '../dto/operation-branch.controller.dto';
import { OperationBranchService } from '../services/operation-branch.service';

@Controller('operation-branch')
export class OperationBranchController {
  constructor(
    private readonly operationBranchService: OperationBranchService,
  ) {}
  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '기관 매니저 연락처를 통해 기관 로그인 코드를 발송한다',
  })
  @ApiOkResponse({
    type: RequestSendCodeResponseDto,
  })
  @Post('request-send-code')
  async requestSendCode(
    @Body() body: RequestSendCodeRequestBodyDto,
  ): Promise<RequestSendCodeResponseDto> {
    await this.operationBranchService.sendLoginCodeByManagerContact(
      body.contact,
    );
    return {
      message: '발송 요청 완료',
    };
  }

  @ApiExcludeEndpoint()
  @Get()
  async getOperationBranchList(): Promise<GetOperationBranchListResponseDto> {
    const operationBranchList =
      await this.operationBranchService.findAllForResponse();

    return {
      data: operationBranchList,
    };
  }

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiOperation({
    description: '현재 로그인한 기관 정보를 가져온다',
  })
  @ApiOkResponse({
    type: LoggedInOperationBranchResponseDto,
  })
  @UseGuards(AuthGuard)
  @Get('me')
  async getLoggedInOperationBranch(
    @Session() session: LoggedInSessionType,
  ): Promise<LoggedInOperationBranchResponseDto> {
    return this.operationBranchService.findById(
      Number(session.LoggedInBranch.id),
    );
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  async getOperationBranch(
    @Param('id') operationBranchId: string,
  ): Promise<OperationBranchResponseDto> {
    return this.operationBranchService.findByIdWithManager(
      Number(operationBranchId),
    );
  }

  @ApiExcludeEndpoint()
  @Post()
  async createOperationBranch(
    @Body() dto: CreateOperationBranchRequestBodyDto,
  ): Promise<CreateOperationBranchResponseDto> {
    await this.operationBranchService.createOperationBranch(dto);
    return {
      message: '기관 생성 완료',
    };
  }
}
