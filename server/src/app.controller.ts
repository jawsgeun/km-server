import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get('ping')
  ping() {
    return `pong! current date ${new Date().toISOString()}`;
  }
}
