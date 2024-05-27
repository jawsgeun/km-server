import { BadRequestException } from '@nestjs/common';

export class PageInvalidException extends BadRequestException {
  constructor() {
    super('Page Value Invalid');
  }
}
