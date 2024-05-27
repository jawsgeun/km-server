import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { setupCorsPolicy } from './setup-cors';
import { setupValidationPipe } from './setup-validation-pipe';
import { setupSession } from './setup-session';

const API_SERVER_PORT = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupValidationPipe(app);
  setupCorsPolicy(app);
  setupSwagger(app);
  setupSession(app);

  await app.listen(API_SERVER_PORT);
}
bootstrap();
