import { NotFoundException } from '@nestjs/common';

export class RawMenuNotFoundException extends NotFoundException {
  constructor() {
    super('RawMenuNotFound');
  }
}
