import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { ApiConfigService } from './services/api-config.service';
import { ApiLoggingInterceptor } from './interceptors/api-logging-interceptor';
import { ExternalApiService } from './services/external-api.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    ApiConfigService,
    ExternalApiService,
    { provide: APP_INTERCEPTOR, useClass: ApiLoggingInterceptor },
  ],
  exports: [ApiConfigService, ExternalApiService],
})
export class SharedModule {}
