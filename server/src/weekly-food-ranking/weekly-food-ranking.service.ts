import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { Between, DataSource, Repository } from 'typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { InjectRepository } from '@nestjs/typeorm';

import {
  GetWeeklyFoodRankingDto,
  WeeklyFoodRankingResponseDto,
} from './dto/weekly-food-ranking.controller.dto';

@Injectable()
export class WeeklyFoodRankingService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly dataSource: DataSource,
  ) {}
  async getWeeklyFoodRanking(dto: GetWeeklyFoodRankingDto) {
    const targetMenuList = await this.menuRepository.find({
      select: ['id'],
      where: {
        operationBranch: {
          id: dto.operationBranchId,
        },
        bld: dto.bld,
        dateServed: Between(
          Number(dto.dateFromYYYYMMDD),
          Number(dto.dateToYYYYMMDD),
        ),
      },
    });
    const menuIdList = _.map(targetMenuList, 'id');
    if (!menuIdList.length) {
      return [];
    }

    const menuItemList = await this.dataSource
      .createQueryBuilder(MenuItem, 'menuItem')
      .where('menuItem.menuId IN (:...menuIdList)', { menuIdList })
      .orderBy({
        'menuItem.totalRemainingFoodAmount': dto.order,
        'menuItem.unitPriceAmount': 'DESC',
        'menuItem.name': 'ASC',
      })
      .limit(3)
      .select([
        'menuItem.id',
        'menuItem.name',
        'menuItem.totalRemainingFoodAmount',
        'menuItem.unitPriceAmount',
      ])
      .getMany();

    return menuItemList.map((menuItem) =>
      WeeklyFoodRankingResponseDto.of(menuItem),
    );
  }
}
