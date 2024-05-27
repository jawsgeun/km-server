import { Injectable } from '@nestjs/common';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationBranchNotFoundException } from 'src/exceptions';

import { LoginDto, LoginResultDto } from './dto/auth.service.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OperationBranch)
    private readonly operationBranchRepository: Repository<OperationBranch>,
  ) {}

  async login(dto: LoginDto): Promise<LoginResultDto> {
    const operationBranch = await this.operationBranchRepository
      .findOneByOrFail({
        loginCode: dto.departmentCode,
      })
      .catch(() => {
        throw new OperationBranchNotFoundException();
      });

    return {
      id: String(operationBranch.id),
    };
  }
}
