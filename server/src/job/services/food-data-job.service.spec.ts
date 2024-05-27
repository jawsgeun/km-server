import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Menu } from 'src/menu/entities/menu.entity';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import {
  FoodData,
  FoodDataUtilizationStatus,
} from 'src/food-data/entities/food-data.entity';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { BLD } from 'src/common/enums';
import { JobException } from 'src/exceptions';
import { JobName } from 'src/constants';
import { MenuItemMemo } from 'src/menu-item/entities/menu-item-memo.entity';

import { FoodDataJobService } from './food-data-job.service';

describe('FoodDataJobService', () => {
  let service: FoodDataJobService;
  let menuRepository: Repository<Menu>;
  let menuItemRepository: Repository<MenuItem>;
  let foodDataRepository: Repository<FoodData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodDataJobService,
        {
          provide: getRepositoryToken(Menu),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FoodData),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FoodDataJobService>(FoodDataJobService);
    menuRepository = module.get<Repository<Menu>>(getRepositoryToken(Menu));
    menuItemRepository = module.get<Repository<MenuItem>>(
      getRepositoryToken(MenuItem),
    );
    foodDataRepository = module.get<Repository<FoodData>>(
      getRepositoryToken(FoodData),
    );
    // dataSource = module.get<DataSource>(DataSource);
  });

  describe('getTargetMenuItemForSyncFoodData', () => {
    it('특정 기관의 foodDataId 가 null 인 메뉴아이템 목록을 가져온다', async () => {
      const givenOperationBranchId = 1;
      const givenMenuItemList = [
        {
          name: '김치',
          menu: {
            operationBranchId: givenOperationBranchId,
          },
          foodDataId: null,
        },
        {
          name: '볶음',
          menu: {
            operationBranchId: givenOperationBranchId,
          },
          foodDataId: 1,
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menuItem.menu = menu;
        menuItem.foodDataId = val.foodDataId;

        const operationBranch = new OperationBranch();
        operationBranch.id = val.menu.operationBranchId;
        menu.operationBranch = operationBranch;

        return menuItem;
      });

      await menuItemRepository.save(givenMenuItemList);

      const menuItemList = await service.getTargetMenuItemForSyncFoodData(
        givenOperationBranchId,
      );

      expect(menuItemList).toEqual(givenMenuItemList);
    });
  });

  describe('syncFoodData', () => {
    it('대상 메뉴아이템 목록을 가져온다', async () => {
      // given
      const givenDto = { operationBranchId: 1 };
      jest
        .spyOn(service, 'getTargetMenuItemForSyncFoodData')
        .mockResolvedValue([]);

      // when
      await service.syncFoodData(givenDto);

      // then
      expect(service.getTargetMenuItemForSyncFoodData).toHaveBeenCalledWith(1);
    });

    it('음식 아이템명 끼니 그룹핑하여 음식데이터 sync 를 진행한다', async () => {
      // given
      const givenDto = { operationBranchId: 1 };
      const givenMenuItemList = [
        {
          name: '김치',
          menu: {
            dateServed: 20240101,
            bld: BLD.B,
          },
        },
        {
          name: '김치',
          menu: {
            dateServed: 20240102,
            bld: BLD.B,
          },
        },
        {
          name: '김치',
          menu: {
            dateServed: 20240101,
            bld: BLD.L,
          },
        },
        {
          name: '볶음',
          menu: {
            dateServed: 20240101,
            bld: BLD.B,
          },
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.bld = val.menu.bld;
        menu.dateServed = val.menu.dateServed;
        menuItem.menu = menu;

        return menuItem;
      });
      jest
        .spyOn(service, 'getTargetMenuItemForSyncFoodData')
        .mockResolvedValue(givenMenuItemList);
      jest.spyOn(service, 'upsertFoodData').mockResolvedValue();

      // when
      await service.syncFoodData(givenDto);

      // then
      expect(service.upsertFoodData).toHaveBeenCalledTimes(3);
      expect(service.upsertFoodData).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        menuItemName: '김치',
        bld: BLD.B,
        menuItemList: [givenMenuItemList[0], givenMenuItemList[1]],
      });
      expect(service.upsertFoodData).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        menuItemName: '김치',
        bld: BLD.L,
        menuItemList: [givenMenuItemList[2]],
      });
      expect(service.upsertFoodData).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        menuItemName: '볶음',
        bld: BLD.B,
        menuItemList: [givenMenuItemList[3]],
      });
    });

    it('특정 입력이 음식데이터 sync 에 실패하는 경우 에러가 발생한다', async () => {
      // given
      const givenDto = { operationBranchId: 1 };
      const givenMenuItemList = [
        {
          name: '김치',
          menu: {
            dateServed: 20240101,
            bld: BLD.B,
          },
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.bld = val.menu.bld;
        menu.dateServed = val.menu.dateServed;
        menuItem.menu = menu;

        return menuItem;
      });
      jest
        .spyOn(service, 'getTargetMenuItemForSyncFoodData')
        .mockResolvedValue(givenMenuItemList);

      const upsertFoodDataError = new Error('unknown error');
      jest
        .spyOn(service, 'upsertFoodData')
        .mockRejectedValue(upsertFoodDataError);

      // when
      const result = service.syncFoodData(givenDto);

      // then
      const expectedMessage = `upsertFoodData failed item: ${JSON.stringify({
        menuItemName: givenMenuItemList[0]!.name,
        bld: givenMenuItemList[0]!.menu.bld,
      })} error: ${upsertFoodDataError.toString()}`;

      await expect(result).rejects.toThrow(
        new JobException(JobName.SYNC_FOOD_DATA, expectedMessage),
      );
    });
  });

  describe('upsertFoodData', () => {
    it('기존에 존재하는 음식 데이터를 찾는다', async () => {
      // given
      const givenDto = {
        operationBranchId: 1,
        menuItemName: '김치',
        bld: BLD.B,
        menuItemList: [],
      };
      jest.spyOn(foodDataRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(service, 'createFoodData').mockResolvedValue(new FoodData());
      jest.spyOn(service, 'updateMenuItemFoodDataId').mockResolvedValue();

      // when
      await service.upsertFoodData(givenDto);

      // then
      expect(foodDataRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(foodDataRepository.findOneBy).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        name: givenDto.menuItemName,
        bld: givenDto.bld,
      });
    });

    it('기존에 존재하는 음식 데이터가 없는 경우, 음식 데이터를 생성한다', async () => {
      // given
      const givenDto = {
        operationBranchId: 1,
        menuItemName: '김치',
        bld: BLD.B,
        menuItemList: [],
      };
      jest.spyOn(foodDataRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(service, 'createFoodData').mockResolvedValue(new FoodData());
      jest.spyOn(service, 'updateFoodData');
      jest.spyOn(service, 'updateMenuItemFoodDataId').mockResolvedValue();

      // when
      await service.upsertFoodData(givenDto);

      // then
      expect(service.updateFoodData).toHaveBeenCalledTimes(0);
      expect(service.createFoodData).toHaveBeenCalledTimes(1);
      expect(service.createFoodData).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        menuItemList: givenDto.menuItemList,
        menuItemName: givenDto.menuItemName,
        bld: givenDto.bld,
      });
    });

    it('기존에 존재하는 음식 데이터가 있는 경우, 음식 데이터를 수정한다', async () => {
      // given
      const givenDto = {
        operationBranchId: 1,
        menuItemName: '김치',
        bld: BLD.B,
        menuItemList: [],
      };
      const givenFoodData = new FoodData();
      jest
        .spyOn(foodDataRepository, 'findOneBy')
        .mockResolvedValueOnce(givenFoodData);
      jest.spyOn(service, 'updateFoodData').mockResolvedValue(givenFoodData);
      jest.spyOn(service, 'createFoodData');
      jest.spyOn(service, 'updateMenuItemFoodDataId').mockResolvedValue();

      // when
      await service.upsertFoodData(givenDto);

      // then
      expect(service.createFoodData).toHaveBeenCalledTimes(0);
      expect(service.updateFoodData).toHaveBeenCalledTimes(1);
      expect(service.updateFoodData).toHaveBeenCalledWith({
        operationBranchId: givenDto.operationBranchId,
        menuItemList: givenDto.menuItemList,
        foodData: givenFoodData,
      });
    });

    it('음식 데이터를 수정 또는 생성한 후, 메뉴아이템의 foodDataId 를 업데이트한다', async () => {
      // given
      const givenDto = {
        operationBranchId: 1,
        menuItemName: '김치',
        bld: BLD.B,
        menuItemList: [],
      };
      const givenFoodData = new FoodData();
      jest
        .spyOn(foodDataRepository, 'findOneBy')
        .mockResolvedValueOnce(givenFoodData);
      jest.spyOn(service, 'updateFoodData').mockResolvedValue(givenFoodData);
      jest.spyOn(service, 'createFoodData');
      jest.spyOn(service, 'updateMenuItemFoodDataId').mockResolvedValue();

      // when
      await service.upsertFoodData(givenDto);

      // then
      expect(service.updateMenuItemFoodDataId).toHaveBeenCalledTimes(1);
      expect(service.updateMenuItemFoodDataId).toHaveBeenCalledWith(
        givenDto.menuItemList,
        givenFoodData.id,
      );
    });
  });

  describe('createFoodData', () => {
    it('실제 식수가 존재하지 않는 메뉴의 아이템에 대한 음식 데이터를 생성한다', async () => {
      // given
      const givenOperationBranchId = 1;
      const givenMenuItemList: MenuItem[] = [
        {
          name: '김치',
          menu: {
            name: 'A코너',
            dateServed: 20240101,
            actualCoverCount: null,
          },
          memoList: [],
        },
        {
          name: '김치',
          menu: {
            name: 'B코너',
            dateServed: 20240102,
            actualCoverCount: null,
          },
          memoList: [
            {
              content: '매운맛',
            },
          ],
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.name = val.menu.name;
        menu.dateServed = val.menu.dateServed;
        menu.actualCoverCount = val.menu.actualCoverCount;
        menuItem.menu = menu;
        menuItem.memoList = val.memoList.map((memo) => {
          const memoEntity = new MenuItemMemo();
          memoEntity.content = memo.content;
          return memoEntity;
        });

        return menuItem;
      });
      const givenInput = {
        operationBranchId: givenOperationBranchId,
        menuItemList: givenMenuItemList,
        menuItemName: '김치',
        bld: BLD.B,
      };

      jest.spyOn(foodDataRepository, 'save').mockResolvedValue(new FoodData());

      // when
      await service.createFoodData(givenInput);

      // then
      expect(foodDataRepository.save).toHaveBeenCalledWith({
        totalActualCoverCount: 0,
        totalMenuItemCount: 0,
        maxCoverCount: 0,
        operationBranchId: givenOperationBranchId,
        name: givenInput.menuItemName,
        bld: givenInput.bld,
        utilizationStatus: FoodDataUtilizationStatus.USE,
        recentServedCornerName: 'B코너',
        dateRecentServed: 20240102,
        hasMemo: true,
      });
    });

    it('음식 데이터를 생성한다', async () => {
      // given
      const givenOperationBranchId = 1;
      const givenMenuItemList: MenuItem[] = [
        {
          name: '김치',
          menu: {
            name: 'A코너',
            dateServed: 20240101,
            actualCoverCount: 100,
          },
          memoList: [],
        },
        {
          name: '김치',
          menu: {
            name: 'B코너',
            dateServed: 20240102,
            actualCoverCount: 200,
          },
          memoList: [
            {
              content: '매운맛',
            },
          ],
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.name = val.menu.name;
        menu.dateServed = val.menu.dateServed;
        menu.actualCoverCount = val.menu.actualCoverCount;
        menuItem.menu = menu;
        menuItem.memoList = val.memoList.map((memo) => {
          const memoEntity = new MenuItemMemo();
          memoEntity.content = memo.content;
          return memoEntity;
        });

        return menuItem;
      });
      const givenInput = {
        operationBranchId: givenOperationBranchId,
        menuItemList: givenMenuItemList,
        menuItemName: '김치',
        bld: BLD.B,
      };

      const givenMenu = new Menu();
      givenMenu.name = '김치';
      givenMenu.actualCoverCount = 200;
      givenMenu.menuItemList = [
        {
          id: 1,
          name: '김치1',
          unitPriceAmount: 1000,
          servingSize: 100,
        },
        {
          id: 2,
          name: '김치2',
          unitPriceAmount: 2000,
          servingSize: 200,
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.id = val.id;
        menuItem.name = val.name;
        menuItem.unitPriceAmount = val.unitPriceAmount;
        menuItem.servingSize = val.servingSize;
        return menuItem;
      });

      jest.spyOn(foodDataRepository, 'save').mockResolvedValue(new FoodData());
      jest.spyOn(menuRepository, 'find').mockResolvedValue([givenMenu]);

      // when
      await service.createFoodData(givenInput);

      // then
      expect(foodDataRepository.save).toHaveBeenCalledWith({
        totalActualCoverCount: 300,
        totalMenuItemCount: 2,
        maxCoverCount: 200,
        operationBranchId: givenOperationBranchId,
        name: givenInput.menuItemName,
        bld: givenInput.bld,
        utilizationStatus: FoodDataUtilizationStatus.USE,
        recentServedCornerName: 'B코너',
        maxCoverCountSiblingMenuItemId: 2,
        dateRecentServed: 20240102,
        hasMemo: true,
      });
    });
  });

  describe.only('updateFoodData', () => {
    const getFoodDataEntity = (): FoodData => {
      const foodData = new FoodData();
      foodData.totalActualCoverCount = 100;
      foodData.totalMenuItemCount = 1;
      foodData.maxCoverCount = 200;
      foodData.recentServedCornerName = 'A코너';
      foodData.dateRecentServed = 20240101;
      foodData.hasMemo = false;

      return foodData;
    };

    it('실제 식수가 존재하지 않는 메뉴의 아이템에 대한 음식 데이터를 생성한다', async () => {
      // given
      const givenOperationBranchId = 1;
      const givenFoodData = getFoodDataEntity();
      const givenMenuItemList: MenuItem[] = [
        {
          name: '김치',
          menu: {
            name: 'A코너',
            dateServed: 20240101,
            actualCoverCount: null,
          },
          memoList: [],
        },
        {
          name: '김치',
          menu: {
            name: 'B코너',
            dateServed: 20240102,
            actualCoverCount: null,
          },
          memoList: [],
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.name = val.menu.name;
        menu.dateServed = val.menu.dateServed;
        menu.actualCoverCount = val.menu.actualCoverCount;
        menuItem.menu = menu;
        menuItem.memoList = [];

        return menuItem;
      });

      const givenInput = {
        foodData: givenFoodData,
        menuItemList: givenMenuItemList,
        operationBranchId: givenOperationBranchId,
      };

      jest.spyOn(foodDataRepository, 'save').mockResolvedValue(new FoodData());

      // when
      await service.updateFoodData(givenInput);

      // then
      expect(foodDataRepository.save).toHaveBeenCalledWith({
        ...givenFoodData,
        recentServedCornerName: 'B코너',
        dateRecentServed: 20240102,
      });
    });
  });

  describe('updateMenuItemFoodDataId', () => {
    it('메뉴 아이템을 저장해야 한다', async () => {
      // given
      const givenFoodDataId = 1;
      const givenMenuItemList: MenuItem[] = [
        {
          name: '김치',
          menu: {
            actualCoverCount: 100,
          },
        },
        {
          name: '볶음',
          menu: {
            actualCoverCount: 200,
          },
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.actualCoverCount = val.menu.actualCoverCount;
        menuItem.menu = menu;

        return menuItem;
      });

      const spyMenuItemRepository = jest.spyOn(menuItemRepository, 'save');

      // when
      await service.updateMenuItemFoodDataId(
        givenMenuItemList,
        givenFoodDataId,
      );

      // then
      expect(spyMenuItemRepository).toHaveBeenCalledWith(
        givenMenuItemList.map((menuItem) => ({
          ...menuItem,
          foodDataId: givenFoodDataId,
        })),
      );
    });

    it('실제 식수가 없는 메뉴아이템은 저장하지 않는다', async () => {
      // given
      const givenFoodDataId = 1;
      const givenMenuItemList: MenuItem[] = [
        {
          name: '김치',
          menu: {
            actualCoverCount: null,
          },
        },
        {
          name: '볶음',
          menu: {
            actualCoverCount: 200,
          },
        },
      ].map((val) => {
        const menuItem = new MenuItem();
        menuItem.name = val.name;

        const menu = new Menu();
        menu.actualCoverCount = val.menu.actualCoverCount;
        menuItem.menu = menu;

        return menuItem;
      });

      const spyMenuItemRepository = jest.spyOn(menuItemRepository, 'save');

      // when
      await service.updateMenuItemFoodDataId(
        givenMenuItemList,
        givenFoodDataId,
      );

      // then
      expect(spyMenuItemRepository).toHaveBeenCalledWith(
        givenMenuItemList
          .filter((menuItem) => menuItem.menu.actualCoverCount !== null)
          .map((menuItem) => ({
            ...menuItem,
            foodDataId: givenFoodDataId,
          })),
      );
    });
  });

  describe('getRecentServedMenu', () => {
    it('should return the most recently served menu', async () => {
      // Test implementation here
    });
  });

  describe('getMaxCoverCount', () => {
    it('should return the maximum cover count', async () => {
      // Test implementation here
    });
  });

  describe('getMaxCoverCountSiblingMenuItemId', () => {
    it('should return the sibling menu item ID with the maximum cover count', async () => {
      // Test implementation here
    });
  });

  describe('getMaxCoverCountMenu', () => {
    it('should return the menu with the maximum cover count', async () => {
      // Test implementation here
    });
  });
});
