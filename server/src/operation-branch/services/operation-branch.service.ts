import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import {
  OperationBranchDuplicatedException,
  OperationBranchManagerNotFoundException,
  OperationBranchNotFoundException,
} from 'src/exceptions';
import { ExternalApiService } from 'src/shared/services/external-api.service';
import { SlackChannel } from 'src/common/enums';

import { OperationBranch } from '../entities/operation-branch.entity';
import { OperationBranchManager } from '../entities/operation-branch-manager.entity';
import {
  LoggedInOperationBranchResponseDto,
  OperationBranchResponseDto,
} from '../dto/operation-branch.controller.dto';
import { CreateOperationBranchDto } from '../dto/operation-branch.service.dto';

interface SendLoginCodeInput {
  branchName: string;
  contact: string;
  loginCode: string;
}

@Injectable()
export class OperationBranchService {
  constructor(
    @InjectRepository(OperationBranch)
    private readonly operationBranchRepository: Repository<OperationBranch>,
    @InjectRepository(OperationBranchManager)
    private readonly operationBranchManagerRepository: Repository<OperationBranchManager>,
    private readonly externalApiService: ExternalApiService,
  ) {}

  async findAll() {
    return this.operationBranchRepository.find();
  }

  async createOperationBranch(dto: CreateOperationBranchDto) {
    const duplicatedOperationBranch =
      await this.operationBranchRepository.findOneBy({
        loginCode: dto.loginCode,
      });

    if (duplicatedOperationBranch) {
      throw new OperationBranchDuplicatedException(['loginCode']);
    }

    await this.operationBranchRepository.save({
      companyName: dto.companyName,
      name: dto.name,
      code: dto.code,
      loginCode: dto.loginCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  async findAllForResponse() {
    const operationBranchList = await this.operationBranchRepository.find();
    return operationBranchList.map(OperationBranchResponseDto.of);
  }

  async findByIdWithManager(id: number) {
    const operationBranch = await this.operationBranchRepository
      .findOneOrFail({
        relations: {
          managerList: true,
        },
        where: { id },
      })
      .catch(() => {
        throw new OperationBranchNotFoundException();
      });

    return OperationBranchResponseDto.of(operationBranch);
  }

  async findById(id: number) {
    const operationBranch = await this.operationBranchRepository
      .findOneOrFail({
        where: { id },
      })
      .catch(() => {
        throw new OperationBranchNotFoundException();
      });

    return LoggedInOperationBranchResponseDto.of(operationBranch);
  }

  async findByCode(code: string) {
    return this.operationBranchRepository.findOne({
      where: { code },
    });
  }

  async sendLoginCodeByManagerContact(contact: string) {
    let whereCondition: FindOptionsWhere<OperationBranchManager>;
    if (!_.isNaN(Number(contact))) {
      whereCondition = {
        tel: contact,
      };
    } else {
      whereCondition = {
        email: contact,
      };
    }

    const manager = await this.operationBranchManagerRepository
      .findOneOrFail({
        relations: {
          operationBranch: true,
        },
        where: whereCondition,
      })
      .catch(() => {
        throw new OperationBranchManagerNotFoundException();
      });

    await this.sendLoginCode({
      branchName: manager.operationBranch.name,
      loginCode: manager.operationBranch.loginCode,
      contact,
    });
  }

  private async sendLoginCode(input: SendLoginCodeInput) {
    //TODO: email 및 SMS 발송
    await this.externalApiService.sendSlackMessage({
      message: `기관 코드 찾기 요청이 발생하였습니다
기관명: ${input.branchName}
기관 CODE: ${input.loginCode}
연락처: ${input.contact}`,
      channel: SlackChannel.KM_PASSCODE_REISSUE,
      emoji: ':blob_help:',
    });
  }
}
