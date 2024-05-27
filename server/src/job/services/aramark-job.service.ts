import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import Bluebird from 'bluebird';
import { JobException } from 'src/exceptions';
import { COMMON_MENU_NAME, JobName } from 'src/constants';
import { RawMenuService } from 'src/raw-food/services/raw-menu.service';
import { RawFoodIngredientService } from 'src/raw-food/services/raw-food-ingredient.service';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';
import { MenuItemService } from 'src/menu-item/menu-item.service';
import { DataSource, In, Repository } from 'typeorm';
import { RawMenuItem } from 'src/raw-food/entities/raw-menu-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';
import { Menu } from 'src/menu/entities/menu.entity';

import {
  UpsertRawMenuItemAndRawFoodIngredientDto,
  UpsertRawMenuDto,
  AaramarkMenuItemDto,
  ConvertToRawMenuEntityDtoDto,
  ConvertToRawMenuItemEntityDtoDto,
} from '../dto/aramark-job.dto';
import { AramarkApiService } from './aramark-api.service';

type RawFoodIngredientDto = {
  name: string;
  unitPriceAmount: number;
  cookQuantity: number;
};

@Injectable()
export class AramarkJobService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RawMenu)
    private readonly rawMenuRepository: Repository<RawMenu>,
    @InjectRepository(RawMenuItem)
    private readonly rawMenuItemRepository: Repository<RawMenuItem>,
    @InjectRepository(RawFoodIngredient)
    private readonly rawFoodIngredientRepository: Repository<RawFoodIngredient>,
    private readonly aramarkApiService: AramarkApiService,
    private readonly rawMenuService: RawMenuService,
    private readonly rawFoodIngredientService: RawFoodIngredientService,
    private readonly menuItemService: MenuItemService,
  ) {}

  async upsertRawMenu(dto: UpsertRawMenuDto) {
    const fetchedMenuItemIngredient =
      await this.aramarkApiService.fetchMenuItemWithFoodIngredient({
        startYYYYMMDD: dto.dateYYYYMMDD,
        endYYYYMMDD: dto.dateYYYYMMDD,
        branchCode: dto.branchCode,
      });

    const fetchedRawMenuDtoList = this.convertToRawMenuEntityDto({
      aramarkMenuItemDtoList: fetchedMenuItemIngredient,
    });

    const rawMenuList = await this.rawMenuRepository.find({
      where: {
        dateServed: Number(dto.dateYYYYMMDD),
        operationBranch: { code: dto.branchCode },
      },
    });

    const createDtoList = _.differenceBy(
      fetchedRawMenuDtoList,
      rawMenuList,
      (item) => `${item.bld}:${item.name}:${item.dateServed}`,
    );

    if (createDtoList.length) {
      await this.rawMenuService.createMany(createDtoList, dto.branchCode);
    }

    const outdatedRawMenuIdList = _(rawMenuList)
      .differenceBy(
        fetchedRawMenuDtoList,
        (item) => `${item.bld}:${item.name}:${item.dateServed}`,
      )
      .map('id')
      .value();

    if (outdatedRawMenuIdList.length) {
      await this.rawMenuRepository.delete({
        id: In(outdatedRawMenuIdList),
      });
    }

    const updatedRawMenuList = rawMenuList
      .filter((rawMenu) => !outdatedRawMenuIdList.includes(rawMenu.id))
      .map((rawMenu) => {
        const rawMenuDto = fetchedRawMenuDtoList.find(
          (rawMenuDtoItem) =>
            rawMenuDtoItem.dateServed === rawMenu.dateServed &&
            rawMenuDtoItem.name === rawMenu.name &&
            rawMenuDtoItem.bld === rawMenu.bld,
        );

        if (!rawMenuDto) {
          throw new JobException(
            JobName.SYNC_ARAMARK_DATA,
            'rawMenuDto not found',
          );
        }
        return {
          ...rawMenu,
          expectedCoverCount: rawMenuDto.expectedCoverCount,
          actualCoverCount: rawMenuDto.actualCoverCount,
        };
      });

    if (updatedRawMenuList.length) {
      await this.rawMenuService.updateMany(updatedRawMenuList);
    }
  }

  async upsertRawMenuItemAndRawFoodIngredient(
    dto: UpsertRawMenuItemAndRawFoodIngredientDto,
  ) {
    const fetchedMenuItemIngredient =
      await this.aramarkApiService.fetchMenuItemWithFoodIngredient({
        startYYYYMMDD: dto.dateYYYYMMDD,
        endYYYYMMDD: dto.dateYYYYMMDD,
        branchCode: dto.branchCode,
      });

    const aramarkMenuItemDtoList = await this.fillIngredientUnitPrice(
      fetchedMenuItemIngredient,
    );

    const rawMenuList = await this.rawMenuRepository.find({
      where: {
        dateServed: Number(dto.dateYYYYMMDD),
        operationBranch: { code: dto.branchCode },
      },
    });

    const rawMenuItemEntityListDto = this.convertToRawMenuItemEntityDto({
      aramarkMenuItemDtoList,
      rawMenuList,
    });

    const rawMenuItemEntityList = rawMenuItemEntityListDto.map((item) => {
      const {
        createRawFoodIngredientDtoList,
        rawMenuDto,
        createRawMenuItemDto,
      } = item;

      const rawMenuItemEntity =
        this.rawMenuItemRepository.create(createRawMenuItemDto);

      const rawFoodIngredientList = createRawFoodIngredientDtoList.map(
        (rawFoodIngredient) =>
          this.rawFoodIngredientRepository.create(rawFoodIngredient),
      );

      rawMenuItemEntity.rawMenu = rawMenuDto;
      rawMenuItemEntity.rawFoodIngredientList = rawFoodIngredientList;
      return rawMenuItemEntity;
    });

    await this.deleteAndCreateRawMenuItem(
      {
        dateYYYYMMDD: dto.dateYYYYMMDD,
        branchCode: dto.branchCode,
      },
      rawMenuItemEntityList,
    );

    await this.createMenuItemByRawMenuItem({
      dateYYYYMMDD: dto.dateYYYYMMDD,
      branchCode: dto.branchCode,
    });
  }

  private async createMenuItemByRawMenuItem(input: {
    dateYYYYMMDD: string;
    branchCode: string;
  }) {
    const { dateYYYYMMDD, branchCode } = input;

    const rawMenuList = await this.rawMenuRepository.find({
      relations: {
        rawMenuItemList: true,
      },
      where: {
        dateServed: Number(dateYYYYMMDD),
        operationBranch: {
          code: branchCode,
        },
      },
    });

    const rawMenuIdList = rawMenuList.map((item) => item.id);

    const rawMenuListWithMenu =
      await this.rawMenuService.findAllWithMenuByIdList(rawMenuIdList);

    const rawMenuItemList = await this.rawMenuItemRepository.find({
      relations: {
        rawMenu: true,
        rawFoodIngredientList: true,
      },
      where: {
        rawMenu: {
          id: In(rawMenuIdList),
        },
      },
    });

    const menuItemDtoList = rawMenuItemList.map((rawMenuItem) => {
      const targetRawMenu = rawMenuListWithMenu.find(
        (rawMenu) => rawMenu.id === rawMenuItem.rawMenu.id,
      );
      if (!targetRawMenu) {
        throw new JobException(JobName.SYNC_ARAMARK_DATA, 'RawMenu not found');
      }

      const cookQuantitySum = _(rawMenuItem.rawFoodIngredientList)
        .map('cookQuantity')
        .sum();

      return {
        name: rawMenuItem.name,
        remainingFoodAmount: 0,
        remainingPriceAmount: 0,
        totalRemainingFoodAmount: 0,
        totalRemainingPriceAmount: 0,
        unitPriceAmount: rawMenuItem.unitPriceAmount,
        servingSize: cookQuantitySum,
        menu: targetRawMenu.menu,
        rawMenuItemId: rawMenuItem.id,
        rawFoodIngredientId: null,
      };
    });

    await this.menuItemService.createMany({ menuItemDtoList });
  }

  private async deleteAndCreateRawMenuItem(
    input: { dateYYYYMMDD: string; branchCode: string },
    rawMenuItemEntityList: RawMenuItem[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetRawMenuList = await queryRunner.manager
        .getRepository(RawMenu)
        .findBy({
          operationBranch: {
            code: input.branchCode,
          },
          dateServed: Number(input.dateYYYYMMDD),
        });

      if (targetRawMenuList.length) {
        targetRawMenuList.forEach((rawMenu) => (rawMenu.rawMenuItemList = []));
        await queryRunner.manager
          .getRepository(RawMenu)
          .save(targetRawMenuList);
      }

      const targetMenuList = await queryRunner.manager
        .getRepository(Menu)
        .findBy({
          operationBranch: {
            code: input.branchCode,
          },
          dateServed: Number(input.dateYYYYMMDD),
        });

      if (targetMenuList.length) {
        targetMenuList.forEach((menu) => (menu.menuItemList = []));
        await queryRunner.manager.getRepository(Menu).save(targetMenuList);
      }

      await queryRunner.manager
        .getRepository(RawMenuItem)
        .save(rawMenuItemEntityList);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new JobException(
        JobName.SYNC_ARAMARK_DATA,
        `RawMenuItem delete and create failed: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async fillIngredientUnitPrice(
    dtoList: AaramarkMenuItemDto[],
  ): Promise<AaramarkMenuItemDto[]> {
    const branchCodeMenuItemCodeGroupList = _(dtoList)
      .groupBy((dto) => `${dto.branchCode}:${dto.menuItemCode}`)
      .map()
      .value();

    const result = await Bluebird.mapSeries(
      branchCodeMenuItemCodeGroupList,
      async (groupItemList) => {
        const groupedItem = groupItemList[0]!;

        const ingredientUnitPriceList =
          await this.aramarkApiService.fetchFoodIngredientWithUnitPrice({
            branchCode: groupedItem.branchCode,
            menuItemCode: groupedItem.menuItemCode,
          });

        return groupItemList.map((mappedItem) => {
          const ingredientUnitPrice = ingredientUnitPriceList.find(
            (item) => item.foodIngredientCode === mappedItem.foodIngredientCode,
          );

          if (!ingredientUnitPrice) {
            throw new JobException(
              JobName.SYNC_ARAMARK_DATA,
              'ingredientUnitPrice not found',
            );
          }

          return {
            ...mappedItem,
            foodIngredientUnitPriceAmount:
              ingredientUnitPrice.foodIngredientUnitPriceAmount,
          };
        });
      },
    );

    return _.flatten(result);
  }

  private convertToRawMenuEntityDto(dto: ConvertToRawMenuEntityDtoDto) {
    const rawMenuEntityDtoList = _(dto.aramarkMenuItemDtoList)
      .groupBy('menuName')
      .map((groupItemList) => {
        const groupedItem = groupItemList[0]!;
        return {
          name: groupedItem.menuName,
          bld: groupedItem.BLD,
          expectedCoverCount: groupedItem.expectedCoverCount,
          actualCoverCount: groupedItem.actualCoverCount,
          dateServed: groupedItem.menuDateYYYYMMDD,
        };
      })
      .value();

    const commonRawMenuEntityDtoList = _(dto.aramarkMenuItemDtoList)
      .groupBy((item) => `${item.BLD}:${item.menuItemName}`)
      .map((groupItemList) => {
        const groupedItem = groupItemList[0]!;
        const isContainCommonMenuItem =
          this.containCommonMenuItem(groupItemList);

        const expectedCoverCountSum = _(groupItemList)
          .uniqBy(({ BLD, menuName }) => `${BLD}:${menuName}`)
          .map('expectedCoverCount')
          .sum();

        const actualCoverCountSum = _(groupItemList)
          .uniqBy(({ BLD, menuName }) => `${BLD}:${menuName}`)
          .map('actualCoverCount')
          .sum();

        if (isContainCommonMenuItem) {
          return {
            name: COMMON_MENU_NAME,
            bld: groupedItem.BLD,
            expectedCoverCount: expectedCoverCountSum,
            actualCoverCount: actualCoverCountSum,
            dateServed: groupedItem.menuDateYYYYMMDD,
          };
        }
        return;
      })
      .compact()
      .uniqBy('bld')
      .value();

    return [...rawMenuEntityDtoList, ...commonRawMenuEntityDtoList];
  }

  private containCommonMenuItem(dtoList: AaramarkMenuItemDto[]) {
    const uniqMenuNameList = _(dtoList).map('menuName').uniq().value();
    return uniqMenuNameList.length > 1;
  }

  mergeCommonRawFoodIngredientList(
    dtoList: AaramarkMenuItemDto[],
  ): Array<RawFoodIngredientDto> {
    const foodIngredientCodeArrayList = _(dtoList)
      .groupBy('menuName')
      .map((groupItemList) =>
        groupItemList.map((item) => item.foodIngredientCode),
      )
      .value();

    const intersectionFoodIngredientCodeList = _.intersection(
      ...foodIngredientCodeArrayList,
    );

    return intersectionFoodIngredientCodeList.map((foodIngredientCode) => {
      const dto = dtoList.find(
        (item) => item.foodIngredientCode === foodIngredientCode,
      );

      if (!dto) {
        throw new JobException(
          JobName.SYNC_ARAMARK_DATA,
          'intersectionFoodIngredient not found',
        );
      }

      return {
        name: dto.foodIngredientName,
        unitPriceAmount: dto.foodIngredientUnitPriceAmount,
        cookQuantity: dto.foodIngredientAmount,
      };
    });
  }

  private convertToRawMenuItemEntityDto(dto: ConvertToRawMenuItemEntityDtoDto) {
    const groupByBLDmenuItemName = _.groupBy(
      dto.aramarkMenuItemDtoList,
      (item) => `${item.BLD}:${item.menuItemName}`,
    );

    return _.map(groupByBLDmenuItemName, (groupItemList) => {
      let rawMenu: RawMenu | undefined;
      const groupedItem = groupItemList[0]!;

      const isContainCommonMenuItem = this.containCommonMenuItem(groupItemList);

      if (isContainCommonMenuItem) {
        rawMenu = dto.rawMenuList.find(
          ({ name, bld }) =>
            bld === groupedItem.BLD && name === COMMON_MENU_NAME,
        );
      } else {
        rawMenu = dto.rawMenuList.find(
          ({ name, bld }) =>
            bld === groupedItem.BLD && name === groupedItem.menuName,
        );
      }

      if (!rawMenu) {
        throw new JobException(JobName.SYNC_ARAMARK_DATA, 'rawMenu not found');
      }

      const createRawMenuItemDto = {
        name: groupedItem.menuItemName,
        unitPriceAmount: groupedItem.menuItemUnitPriceAmount,
        bld: groupedItem.BLD,
        dateServed: groupedItem.menuDateYYYYMMDD,
      };

      let createRawFoodIngredientDtoList: Array<RawFoodIngredientDto>;

      if (isContainCommonMenuItem) {
        createRawFoodIngredientDtoList =
          this.mergeCommonRawFoodIngredientList(groupItemList);
      } else {
        createRawFoodIngredientDtoList = groupItemList.map((item) => ({
          name: item.foodIngredientName,
          unitPriceAmount: item.foodIngredientUnitPriceAmount,
          cookQuantity: item.foodIngredientAmount,
        }));
      }

      return {
        rawMenuDto: rawMenu,
        createRawMenuItemDto,
        createRawFoodIngredientDtoList,
      };
    });
  }

  async needSync(dateYYYYMMDD: string, branchCode: string) {
    // TODO: 추후 S3 내 일일 백업 등의 방법으로 diff 체크
    const apiResult =
      await this.aramarkApiService.fetchMenuItemWithFoodIngredient({
        startYYYYMMDD: dateYYYYMMDD,
        endYYYYMMDD: dateYYYYMMDD,
        branchCode,
      });

    const rawMenuList = await this.rawMenuService.findAllWithMenuItemList({
      dateServed: Number(dateYYYYMMDD),
      branchCode,
    });

    const rawMenuItemList = _(rawMenuList)
      .map('rawMenuItemList')
      .flatten()
      .value();

    const rawFoodIngredientList =
      await this.rawFoodIngredientService.findAllByMenuItem({
        rawMenuItemList,
      });

    return apiResult.length !== rawFoodIngredientList.length;
  }
}
