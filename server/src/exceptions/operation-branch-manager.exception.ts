import { NotFoundException } from '@nestjs/common';

export class OperationBranchManagerNotFoundException extends NotFoundException {
  constructor() {
    super('해당하는 기관 매니저 정보가 없습니다');
  }
}
