import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  KITCHEN_MANGER_WEB_TAG,
  KITCHEN_MANGER_WEB_TAG_WIP,
} from './constants/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('키친 매니저 API')
    .setDescription('키친 매니저 API description')
    .setVersion('1.0')
    .addTag(KITCHEN_MANGER_WEB_TAG)
    .addTag(KITCHEN_MANGER_WEB_TAG_WIP)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}
