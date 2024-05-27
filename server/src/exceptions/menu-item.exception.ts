import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class MenuItemNotFoundException extends NotFoundException {
  constructor() {
    super('MenuItemNotFound');
  }
}

export class MenuItemDeactivatedException extends UnprocessableEntityException {
  constructor() {
    super('비활성화된 메뉴 아이템입니다.');
  }
}
