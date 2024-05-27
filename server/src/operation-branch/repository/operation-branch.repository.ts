import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { OperationBranch } from '../entities/operation-branch.entity';

type CreateOperationBranchManagerDto = {
  name: string;
  tel: string | null;
  telCountryCode: string | null;
  email: string | null;
};

@Injectable()
export class OperationBranchRepository extends Repository<OperationBranch> {
  createManager(dto: CreateOperationBranchManagerDto) {}
}
