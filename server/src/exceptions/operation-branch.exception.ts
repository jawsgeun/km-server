import { ConflictException, NotFoundException } from '@nestjs/common';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';

export class OperationBranchNotFoundException extends NotFoundException {
  constructor() {
    super('입력하신 내용과 일치하는 기관 정보가 없어요');
  }
}

type OperationBranchField = keyof OperationBranch;

export class OperationBranchDuplicatedException extends ConflictException {
  constructor(duplicatedFieldList: OperationBranchField[]) {
    super(
      `입력하신 내용과 중복되는 기관 정보가 이미 존재해요 중복 값(${duplicatedFieldList.join(
        ',',
      )})`,
    );
  }
}
