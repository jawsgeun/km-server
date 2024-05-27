import {
  Controller,
  Post,
  Body,
  Session,
  Req,
  Logger,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KITCHEN_MANGER_WEB_TAG } from 'src/constants/swagger';
import { SessionType } from 'src/common/dto';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  LoginResponseDto,
  LooutResponseDto,
} from './dto/auth.controller.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({ type: LoginResponseDto })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginRequestDto,
    @Session() session: SessionType,
  ): Promise<LoginResponseDto> {
    const loginResult = await this.authService.login(dto);

    session.LoggedInBranch = {
      id: loginResult.id,
      dateSessionCreated: new Date().toISOString(),
    };

    return {
      message: '로그인 성공',
    };
  }

  @UseGuards(AuthGuard)
  @ApiTags(KITCHEN_MANGER_WEB_TAG)
  @ApiResponse({ type: LooutResponseDto })
  @Post('logout')
  @HttpCode(200)
  logout(@Req() request: Request): LooutResponseDto {
    request.session.destroy((error) => {
      if (error) {
        this.logger.error(
          `session destroy failed session: ${JSON.stringify(
            request.session,
          )} error: ${error.toString()}`,
        );
      }
    });

    return {
      message: '로그아웃 성공',
    };
  }
}
