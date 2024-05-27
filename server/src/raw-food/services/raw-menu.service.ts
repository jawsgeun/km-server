import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OperationBranchService } from 'src/operation-branch/services/operation-branch.service';
import {
  OperationBranchNotFoundException,
  RawMenuNotFoundException,
} from 'src/exceptions';
import _ from 'lodash';
import { Menu } from 'src/menu/entities/menu.entity';

import {
  FindAllWithMenuItemListDto,
  CreateRawMenuDto,
  UpdateRawMenuDto,
} from '../dto/raw-menu.service.dto';
import { RawMenu } from '../entities/raw-menu.entity';

@Injectable()
export class RawMenuService {
  constructor(
    @InjectRepository(RawMenu)
    private readonly rawMenuRepository: Repository<RawMenu>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly operationBranchService: OperationBranchService,
  ) {}

  async createMany(rawMenuDtoList: CreateRawMenuDto[], branchCode: string) {
    const operationBranch =
      await this.operationBranchService.findByCode(branchCode);

    if (!operationBranch) {
      throw new OperationBranchNotFoundException();
    }

    const hasInvalidActualCoverCount = _.some(rawMenuDtoList, {
      actualCoverCount: 0,
    });

    const rawMenuEntityList = rawMenuDtoList.map((rawMenuDto, index) => {
      const rawMenuEntity = this.rawMenuRepository.create(rawMenuDto);

      const menuEntity = this.menuRepository.create({
        ...rawMenuDto,
        order: index + 1,
        actualCoverCount: hasInvalidActualCoverCount
          ? null
          : rawMenuDto.actualCoverCount,
      });

      return {
        ...rawMenuEntity,
        operationBranch,
        menu: {
          ...menuEntity,
          operationBranch,
        },
      };
    });

    return this.rawMenuRepository.save(rawMenuEntityList);
  }

  async updateMany(rawMenuDtoList: UpdateRawMenuDto[]) {
    const rawMenuEntityList = await this.rawMenuRepository.find({
      where: {
        id: In(rawMenuDtoList.map(({ id }) => id)),
      },
      relations: {
        menu: true,
      },
    });

    const hasInvalidActualCoverCount = _.some(rawMenuDtoList, {
      actualCoverCount: 0,
    });

    const updatedRawMenuEntityList = rawMenuEntityList.map((rawMenuEntity) => {
      const rawMenuDto = rawMenuDtoList.find(
        (rawMenuDto) => rawMenuDto.id === rawMenuEntity.id,
      );

      if (!rawMenuDto) {
        throw new RawMenuNotFoundException();
      }

      return {
        ...rawMenuEntity,
        actualCoverCount: rawMenuDto.actualCoverCount,
        expectedCoverCount: rawMenuDto.expectedCoverCount,
        menu: {
          ...rawMenuEntity.menu,
          actualCoverCount: hasInvalidActualCoverCount
            ? null
            : rawMenuDto.actualCoverCount,
          expectedCoverCount: rawMenuDto.expectedCoverCount,
        },
      };
    });
    return this.rawMenuRepository.save(updatedRawMenuEntityList);
  }

  async findAllWithMenuItemList(dto: FindAllWithMenuItemListDto) {
    const operationBranch = await this.operationBranchService.findByCode(
      dto.branchCode,
    );

    if (!operationBranch) {
      throw new OperationBranchNotFoundException();
    }

    return this.rawMenuRepository.find({
      relations: {
        rawMenuItemList: true,
        operationBranch: true,
      },
      where: {
        dateServed: dto.dateServed,
        operationBranch: {
          id: operationBranch.id,
        },
      },
    });
  }

  async findAllWithMenuByIdList(idList: number[]) {
    return this.rawMenuRepository.find({
      relations: {
        menu: true,
      },
      where: {
        id: In(idList),
      },
    });
  }
}
