import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { FoodDataNotFoundException } from 'src/exceptions';
import _ from 'lodash';
import { BLD } from 'src/common/enums';
import { InjectRepository } from '@nestjs/typeorm';

import { GetFoodDataListDto } from '../dto/food-data.service.dto';
import {
  FoodData,
  FoodDataUtilizationStatus,
} from '../entities/food-data.entity';
import { FoodDataResponseDto } from '../dto/food-data.controller.dto';

@Injectable()
export class FoodDataService {
  private readonly logger = new Logger(FoodDataService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(FoodData)
    private readonly foodDataRepository: Repository<FoodData>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async refreshFoodDataHasMemo(id: number) {
    const foodData = await this.foodDataRepository.findOneBy({ id });
    if (!foodData) {
      this.logger.error(`refreshFoodDataHasMemo: foodData not found: ${id}`);
      return;
    }

    const menuItemList = await this.menuItemRepository.find({
      relations: {
        memoList: true,
      },
      where: {
        foodDataId: id,
      },
    });

    const hasMemo = menuItemList.some(
      (menuItem) => menuItem.memoList.length > 0,
    );

    foodData.hasMemo = hasMemo;

    return this.foodDataRepository.save(foodData);
  }

  private buildMenuItemQueryForFoodData(
    bld: BLD,
    dateFromYYYYMMDD: string,
    dateToYYYYMMDD: string,
    operationBranchId: string,
  ) {
    return this.dataSource
      .createQueryBuilder(MenuItem, 'menuItem')
      .distinct(true)
      .select(['menuItem.foodDataId'])
      .innerJoin('menuItem.menu', 'menu')
      .where('menuItem.foodDataId IS NOT NULL')
      .andWhere('menu.operationBranchId = :operationBranchId', {
        operationBranchId,
      })
      .andWhere('menu.bld = :bld', { bld })
      .andWhere('menu.dateServed >= :dateFromYYYYMMDD', {
        dateFromYYYYMMDD: Number(dateFromYYYYMMDD),
      })
      .andWhere('menu.dateServed <= :dateToYYYYMMDD', {
        dateToYYYYMMDD: Number(dateToYYYYMMDD),
      });
  }

  async getFoodDataListTotalCount(dto: GetFoodDataListDto) {
    const { bld, dateFromYYYYMMDD, dateToYYYYMMDD, operationBranchId } = dto;

    const query = this.buildMenuItemQueryForFoodData(
      bld,
      dateFromYYYYMMDD,
      dateToYYYYMMDD,
      operationBranchId,
    );

    //FIXME: getCount 를 하게 되면 menuIten.id 기준으로 DISTINCT 설정이 됨, 추후 RawQuery 로 변경
    const result = await query.getRawMany();

    return result.length;
  }

  async getFoodDataList(dto: GetFoodDataListDto) {
    const {
      bld,
      dateFromYYYYMMDD,
      dateToYYYYMMDD,
      page,
      sizePerPage,
      operationBranchId,
      dateRecentServedOrder,
    } = dto;

    const skipCount = (page - 1) * sizePerPage;

    const query = this.buildMenuItemQueryForFoodData(
      bld,
      dateFromYYYYMMDD,
      dateToYYYYMMDD,
      operationBranchId,
    );

    const queryResult = await query.getRawMany<{
      menuItem_foodDataId: number;
    }>();
    const foodDataIdList = _.map(queryResult, 'menuItem_foodDataId');
    if (!foodDataIdList.length) {
      return [];
    }

    const { entities: foodDataList, raw: menuItemList } = await this.dataSource
      .createQueryBuilder(FoodData, 'foodData')
      .where('foodData.id IN (:...foodDataIdList)', { foodDataIdList })
      .orderBy({
        'foodData.dateRecentServed': dateRecentServedOrder,
      })
      .offset(skipCount)
      .limit(sizePerPage)
      .leftJoinAndSelect(
        MenuItem,
        'menuItem',
        'menuItem.id = foodData.maxCoverCountSiblingMenuItemId',
      )
      .getRawAndEntities<{ foodData_id: number; menuItem_name: string }>();

    return foodDataList.map((foodData) => {
      const siblingMenuItemName = menuItemList.find(
        (menuItem) => menuItem.foodData_id === foodData.id,
      )?.menuItem_name;

      return FoodDataResponseDto.of({
        ...foodData,
        siblingMenuItemName,
      });
    });
  }

  async validateOperationBranchFoodData(
    foodDataId: number,
    operationBranchId: number,
  ) {
    const foodData = await this.foodDataRepository.findOneBy({
      id: foodDataId,
      operationBranchId,
    });

    if (!foodData) {
      throw new FoodDataNotFoundException();
    }
  }

  async getFoodData(foodDataId: number) {
    const foodData = await this.foodDataRepository
      .findOneByOrFail({
        id: foodDataId,
      })
      .catch(() => {
        throw new FoodDataNotFoundException();
      });

    if (!foodData.maxCoverCountSiblingMenuItemId) {
      return FoodDataResponseDto.of(foodData);
    }

    const siblingMenuItem = await this.menuItemRepository.findOneBy({
      id: foodData.maxCoverCountSiblingMenuItemId,
    });

    if (!siblingMenuItem) {
      return FoodDataResponseDto.of(foodData);
    }

    return FoodDataResponseDto.of({
      ...foodData,
      siblingMenuItemName: siblingMenuItem.name,
    });
  }

  async updateFoodDataUtilizationStatus(
    foodId: number,
    newStatus: FoodDataUtilizationStatus,
  ) {
    const foodData = await this.foodDataRepository
      .findOneByOrFail({ id: foodId })
      .catch(() => {
        throw new FoodDataNotFoundException();
      });

    foodData.utilizationStatus = newStatus;

    return this.foodDataRepository.save(foodData);
  }
}
