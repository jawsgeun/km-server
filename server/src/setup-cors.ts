import { INestApplication } from '@nestjs/common';

export function setupCorsPolicy(app: INestApplication) {
  app.enableCors({
    origin: [/https:\/\/.*\.nuvilab\.com/, 'http://localhost:3000'],
    methods: '*',
    credentials: true,
  });
}
