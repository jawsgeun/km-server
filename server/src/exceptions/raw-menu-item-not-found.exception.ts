import { NotFoundException } from '@nestjs/common';

export class RawMenuItemNotFoundException extends NotFoundException {
  constructor() {
    super('RawMenuItemNotFound');
  }
}
