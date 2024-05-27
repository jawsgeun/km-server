import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationBranchNotFoundException } from 'src/exceptions';

import { OperationBranch } from '../entities/operation-branch.entity';
import { OperationBranchManager } from '../entities/operation-branch-manager.entity';
import { CreateOperationBranchManagerDto } from '../dto/operation-branch-manager.service.dto';

@Injectable()
export class OperationBranchManagerService {
  constructor(
    @InjectRepository(OperationBranch)
    private readonly operationBranchRepository: Repository<OperationBranch>,
    @InjectRepository(OperationBranchManager)
    private readonly operationBranchManagerRepository: Repository<OperationBranchManager>,
  ) {}

  async createOperationBranchManager(dto: CreateOperationBranchManagerDto) {
    const { operationBranchId } = dto;

    const operationBranch = await this.operationBranchRepository
      .findOneOrFail({
        relations: {
          managerList: true,
        },
        where: {
          id: operationBranchId,
        },
      })
      .catch(() => {
        throw new OperationBranchNotFoundException();
      });

    const operationBranchManagerEntity =
      this.operationBranchManagerRepository.create({
        name: dto.name,
        tel: dto.tel,
        telCountryCode: dto.telCountryCode,
        email: dto.email,
      });

    operationBranch.managerList.push(operationBranchManagerEntity);

    await this.operationBranchRepository.save(operationBranch);
  }
}
