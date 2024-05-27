import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { ApiConfigService } from './api-config.service';
import { SendSlackMessageDto } from '../dto/external-api.service.dto';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(
    private readonly apiConfigService: ApiConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendSlackMessage(dto: SendSlackMessageDto) {
    const isLocal = this.apiConfigService.isLocal;
    const isDebug = this.apiConfigService.isDebug;
    if (isLocal || isDebug) {
      this.logger.log(`sendSlackMessage LOCAL, dto: ${JSON.stringify(dto)}`);
      return;
    }

    const hookUrl = this.apiConfigService.nuvilabSlackHookUrl;
    const isProduction = this.apiConfigService.isProduction;

    try {
      await firstValueFrom(
        this.httpService.post(hookUrl, {
          text: dto.message,
          username: dto.username || 'KM Slack Bot',
          icon_emoji: dto.emoji || ':sugeun-jo:',
          channel: `#${!isProduction ? 'dev-' : ''}${dto.channel}`,
        }),
      );
    } catch (error) {
      this.logger.error(`sendSlackMessage error:`, error.message);
    }
  }
}
