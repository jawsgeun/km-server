import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import { JobException } from 'src/exceptions';
import { COMMON_MENU_NAME, JobName } from 'src/constants';
import {
  FoodData,
  FoodDataUtilizationStatus,
} from 'src/food-data/entities/food-data.entity';
import { Menu } from 'src/menu/entities/menu.entity';

import {
  CreateFoodDataDto,
  GetMaxCoverCountSiblingMenuItemIdDto,
  SyncFoodDataDto,
  UpdateFoodDataDto,
  UpsertFoodDataDto,
} from '../dto/food-data-job.service.dto';

@Injectable()
export class FoodDataJobService {
  private readonly logger = new Logger(FoodDataJobService.name);
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(FoodData)
    private readonly foodDataRepository: Repository<FoodData>,
    private readonly dataSource: DataSource,
  ) {}

  async getTargetMenuItemForSyncFoodData(operationBranchId: number) {
    const targetMenuItemList = await this.dataSource
      .createQueryBuilder(MenuItem, 'menuItem')
      .select(['menuItem.id'])
      .innerJoin('menuItem.menu', 'menu')
      .where('menuItem.foodDataId IS NULL')
      .orWhere('menuItem.foodDataCoverCountSynced = 0')
      .andWhere('menu.operationBranchId = :operationBranchId', {
        operationBranchId,
      })
      .getMany();

    const menuItemIdList = _.map(targetMenuItemList, 'id');
    return this.menuItemRepository.find({
      relations: {
        menu: true,
        memoList: true,
      },
      where: {
        id: In(menuItemIdList),
      },
    });
  }

  async syncFoodData(dto: SyncFoodDataDto) {
    const { operationBranchId } = dto;
    const targetMenuItemList =
      await this.getTargetMenuItemForSyncFoodData(operationBranchId);

    const menuItemNameBldGroupList = _(targetMenuItemList)
      .groupBy((menuItem) => `${menuItem.name}:${menuItem.menu.bld}`)
      .map()
      .value();

    const result = await Promise.allSettled(
      menuItemNameBldGroupList.map((menuItemList) => {
        const groupedMenuItem = menuItemList[0]!;

        return this.upsertFoodData({
          operationBranchId,
          menuItemName: groupedMenuItem.name,
          bld: groupedMenuItem.menu.bld,
          menuItemList,
        });
      }),
    );

    const failedResult = result.filter((item) => item.status === 'rejected');

    if (failedResult.length) {
      const errorMessageList: string[] = [];

      result.forEach((item, index) => {
        if (item.status === 'rejected') {
          const message = `upsertFoodData failed item: ${JSON.stringify({
            menuItemName: menuItemNameBldGroupList[index]![0]?.name,
            bld: menuItemNameBldGroupList[index]![0]?.menu.bld,
          })} error: ${item.reason}`;

          this.logger.error(message);
          errorMessageList.push(message);
        }
      });

      throw new JobException(
        JobName.SYNC_FOOD_DATA,
        errorMessageList.join('\n'),
      );
    }
  }

  async upsertFoodData(dto: UpsertFoodDataDto) {
    const { menuItemName, bld, menuItemList, operationBranchId } = dto;

    const existFoodData = await this.foodDataRepository.findOneBy({
      operationBranchId,
      name: menuItemName,
      bld,
    });

    let createdFoodData: FoodData;

    if (!existFoodData) {
      createdFoodData = await this.createFoodData({
        operationBranchId,
        menuItemList,
        menuItemName,
        bld,
      });
    } else {
      createdFoodData = await this.updateFoodData({
        operationBranchId,
        menuItemList,
        foodData: existFoodData,
      });
    }

    const syncedMenuItemCount = menuItemList.filter((menuItem) =>
      _.isNil(menuItem.foodDataId),
    ).length;
    createdFoodData.servingCount += syncedMenuItemCount;
    await this.foodDataRepository.save(createdFoodData);

    await this.updateMenuItemFoodDataId(menuItemList, createdFoodData.id);
  }

  async createFoodData(dto: CreateFoodDataDto): Promise<FoodData> {
    const { menuItemList, menuItemName, bld, operationBranchId } = dto;

    const foodData = new FoodData();
    foodData.servingCount = 0;
    foodData.totalActualCoverCount = 0;
    foodData.totalMenuItemCount = 0;
    foodData.maxCoverCount = 0;
    foodData.operationBranchId = operationBranchId;

    foodData.name = menuItemName;
    foodData.bld = bld;
    foodData.utilizationStatus = FoodDataUtilizationStatus.USE;

    const recentServedMenu = this.getRecentServedMenu(menuItemList);
    foodData.recentServedCornerName = recentServedMenu.name;
    foodData.dateRecentServed = recentServedMenu.dateServed;

    const menuItemListHasMemo = menuItemList.reduce((acc, cur) => {
      return acc || Boolean(cur.memoList.length);
    }, false);
    foodData.hasMemo = foodData.hasMemo || menuItemListHasMemo;

    const validCoverCountMenuItemList = menuItemList.filter(
      ({ menu }) => !_.isNil(menu.actualCoverCount),
    );

    if (!validCoverCountMenuItemList.length) {
      return this.foodDataRepository.save(foodData);
    }

    const sumActualCoverCount = _(validCoverCountMenuItemList)
      .map('menu')
      .sumBy('actualCoverCount');
    foodData.totalActualCoverCount += sumActualCoverCount;

    foodData.totalMenuItemCount += validCoverCountMenuItemList.length;

    const maxCoverCountMenu = this.getMaxCoverCountMenu(menuItemList);

    foodData.maxCoverCount = this.getMaxCoverCount(maxCoverCountMenu, null);

    foodData.maxCoverCountSiblingMenuItemId =
      await this.getMaxCoverCountSiblingMenuItemId({
        operationBranchId,
        maxCoverCountMenu,
        foodData: null,
      });

    return this.foodDataRepository.save(foodData);
  }

  async updateFoodData(dto: UpdateFoodDataDto): Promise<FoodData> {
    const { foodData: existFoodData, menuItemList, operationBranchId } = dto;

    const recentServedMenu = this.getRecentServedMenu(menuItemList);

    if (existFoodData.dateRecentServed < recentServedMenu.dateServed) {
      existFoodData.recentServedCornerName = recentServedMenu.name;
      existFoodData.dateRecentServed = recentServedMenu.dateServed;
    }

    const menuItemListHasMemo = menuItemList.reduce((acc, cur) => {
      return acc || Boolean(cur.memoList.length);
    }, false);
    existFoodData.hasMemo = existFoodData.hasMemo || menuItemListHasMemo;

    const validCoverCountMenuItemList = menuItemList.filter(
      ({ menu }) => !_.isNil(menu.actualCoverCount),
    );

    if (!validCoverCountMenuItemList.length) {
      return this.foodDataRepository.save(existFoodData);
    }

    const sumActualCoverCount = _(validCoverCountMenuItemList)
      .map('menu')
      .sumBy('actualCoverCount');
    existFoodData.totalActualCoverCount += sumActualCoverCount;

    existFoodData.totalMenuItemCount += validCoverCountMenuItemList.length;

    const maxCoverCountMenu = this.getMaxCoverCountMenu(menuItemList);

    existFoodData.maxCoverCount = this.getMaxCoverCount(
      maxCoverCountMenu,
      existFoodData,
    );

    existFoodData.maxCoverCountSiblingMenuItemId =
      await this.getMaxCoverCountSiblingMenuItemId({
        operationBranchId,
        maxCoverCountMenu,
        foodData: existFoodData,
      });

    return this.foodDataRepository.save(existFoodData);
  }

  async updateMenuItemFoodDataId(menuItemList: MenuItem[], foodDataId: number) {
    await this.menuItemRepository.save(
      menuItemList.map((menuItem) => ({
        ...menuItem,
        foodDataId,
        foodDataCoverCountSynced: _.isNil(menuItem.menu.actualCoverCount)
          ? false
          : true,
      })),
    );
  }

  private getRecentServedMenu(menuItemList: MenuItem[]) {
    const recentServedMenu = _(menuItemList).map('menu').maxBy('dateServed');
    if (!recentServedMenu) {
      throw new JobException(
        JobName.SYNC_FOOD_DATA,
        'recentServedMenu not found',
      );
    }
    return recentServedMenu;
  }

  private getMaxCoverCount(maxCoverCountMenu: Menu, foodData: FoodData | null) {
    if (!foodData) {
      return maxCoverCountMenu.actualCoverCount || 0;
    }

    if (!maxCoverCountMenu.actualCoverCount) {
      return foodData.maxCoverCount;
    }

    return maxCoverCountMenu.actualCoverCount > foodData.maxCoverCount
      ? maxCoverCountMenu.actualCoverCount
      : foodData.maxCoverCount;
  }

  private async getMaxCoverCountSiblingMenuItemId(
    dto: GetMaxCoverCountSiblingMenuItemIdDto,
  ) {
    const { maxCoverCountMenu, foodData, operationBranchId } = dto;

    let findWhereCondition: FindOptionsWhere<Menu>;

    if (maxCoverCountMenu.name === COMMON_MENU_NAME) {
      findWhereCondition = {
        operationBranch: {
          id: operationBranchId,
        },
        dateServed: maxCoverCountMenu.dateServed,
      };
    } else {
      findWhereCondition = {
        id: maxCoverCountMenu.id,
      };
    }

    const menuList = await this.menuRepository.find({
      relations: {
        menuItemList: true,
      },
      where: findWhereCondition,
    });

    const maxCoverCountMenuItemList = _(menuList)
      .map('menuItemList')
      .flatten()
      .value();

    const [siblingMenuItem] = _.orderBy(
      maxCoverCountMenuItemList,
      ['unitPriceAmount', 'servingSize'],
      ['desc', 'desc'],
    );

    if (!siblingMenuItem) {
      throw new JobException(
        JobName.SYNC_FOOD_DATA,
        'siblingMenuItem not found',
      );
    }

    if (!foodData) {
      return siblingMenuItem.id;
    }

    if (!maxCoverCountMenu.actualCoverCount) {
      return foodData.maxCoverCountSiblingMenuItemId;
    }

    return maxCoverCountMenu.actualCoverCount >= foodData.maxCoverCount
      ? siblingMenuItem.id
      : foodData.maxCoverCountSiblingMenuItemId;
  }

  private getMaxCoverCountMenu(menuItemList: MenuItem[]) {
    const maxCoverCountMenu = _(menuItemList)
      .map('menu')
      .maxBy('actualCoverCount');

    if (!maxCoverCountMenu) {
      throw new JobException(
        JobName.SYNC_FOOD_DATA,
        'maxCoverCountMenu not found',
      );
    }
    return maxCoverCountMenu;
  }
}
