import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RawMenuItemNotFoundException } from 'src/exceptions';

import { RawMenuItem } from '../entities/raw-menu-item.entity';
import { FindAllRawMenuItemDto } from '../dto/raw-menu-item.service.dto';

@Injectable()
export class RawMenuItemService {
  constructor(
    @InjectRepository(RawMenuItem)
    private readonly rawMenuItemRepository: Repository<RawMenuItem>,
  ) {}

  async getPriceAmountPerCookQuantity(id: number) {
    const rawMenuItem = await this.findByIdWithFoodIngredient(id);

    const cookQuantitySum = _(rawMenuItem.rawFoodIngredientList)
      .map('cookQuantity')
      .sum();

    return rawMenuItem.unitPriceAmount / cookQuantitySum;
  }

  async findByIdWithFoodIngredient(id: number) {
    const rawMenuItem = await this.rawMenuItemRepository.findOne({
      relations: {
        rawFoodIngredientList: true,
      },
      where: {
        id,
      },
    });

    if (!rawMenuItem) {
      throw new RawMenuItemNotFoundException();
    }

    return rawMenuItem;
  }

  async findAll(dto: FindAllRawMenuItemDto) {
    const { dateServed, bld, operationBranchId } = dto;
    return this.rawMenuItemRepository
      .createQueryBuilder('rawMenuItem')
      .innerJoin('rawMenuItem.rawMenu', 'rawMenu')
      .leftJoinAndSelect(
        'rawMenuItem.rawFoodIngredientList',
        'rawFoodIngredient',
      )
      .where('rawMenuItem.dateServed = :dateServed', { dateServed })
      .andWhere('rawMenuItem.bld = :bld', { bld })
      .andWhere('rawMenu.operationBranchId = :operationBranchId', {
        operationBranchId,
      })
      .getMany();
  }
}
