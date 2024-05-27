import { Test } from '@nestjs/testing';
import { BLD } from 'src/common/enums';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';
import { RawMenuItem } from 'src/raw-food/entities/raw-menu-item.entity';
import { RawFoodIngredient } from 'src/raw-food/entities/raw-food-ingredient.entity';
import { DataSource } from 'typeorm';
import { RawMenuService } from 'src/raw-food/services/raw-menu.service';
import { RawFoodIngredientService } from 'src/raw-food/services/raw-food-ingredient.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';

import { AramarkJobService } from './aramark-job.service';
import { AaramarkMenuItemDto } from '../dto/aramark-job.dto';
import { AramarkApiService } from './aramark-api.service';
const commonAramarkMenuItemDto = {
  branchName: 'Branch 1',
  branchCode: 'B1',
  menuDateYYYYMMDD: 20220101,

  BLD: BLD.B,
  expectedCoverCount: 10,
  actualCoverCount: 8,
  menuItemName: 'Menu Item 1',
  menuItemCode: 'MI1',
  menuItemSeq: '1',
  menuItemUnitPriceAmount: 9,
};

describe('AramarkJobService', () => {
  let service: AramarkJobService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AramarkJobService,
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: getRepositoryToken(RawMenu),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RawMenuItem),
          useValue: {},
        },
        {
          provide: getRepositoryToken(RawFoodIngredient),
          useValue: {},
        },
        {
          provide: AramarkApiService,
          useValue: {},
        },
        {
          provide: RawMenuService,
          useValue: {},
        },
        {
          provide: RawFoodIngredientService,
          useValue: {},
        },
        {
          provide: MenuItemService,
          useValue: {},
        },
      ],
    }).compile();

    service = moduleRef.get<AramarkJobService>(AramarkJobService);
  });

  describe('mergeCommonRawFoodIngredientList', () => {
    it('각 메뉴 별로 공통되는 식재료를 식재료 Code를 기준으로 merge 한다', () => {
      // given
      const dtoList: AaramarkMenuItemDto[] = [
        {
          ...commonAramarkMenuItemDto,
          menuName: 'Menu 1',
          foodIngredientName: 'Ingredient 1',
          foodIngredientCode: 'I1',
          foodIngredientUnitPriceAmount: 3,
          foodIngredientAmount: 2,
          foodIngredientAmountUnit: 'g',
        },
        {
          ...commonAramarkMenuItemDto,
          menuName: 'Menu 1',
          foodIngredientName: 'Ingredient 2',
          foodIngredientCode: 'I2',
          foodIngredientUnitPriceAmount: 5,
          foodIngredientAmount: 3,
          foodIngredientAmountUnit: 'g',
        },
        {
          ...commonAramarkMenuItemDto,
          menuName: 'Menu 2',
          foodIngredientName: 'Ingredient 2',
          foodIngredientCode: 'I2',
          foodIngredientUnitPriceAmount: 5,
          foodIngredientAmount: 3,
          foodIngredientAmountUnit: 'g',
        },
        {
          ...commonAramarkMenuItemDto,
          menuName: 'Menu 2',
          foodIngredientName: 'Ingredient 3',
          foodIngredientCode: 'I3',
          foodIngredientUnitPriceAmount: 6,
          foodIngredientAmount: 4,
          foodIngredientAmountUnit: 'g',
        },
        {
          ...commonAramarkMenuItemDto,
          menuName: 'Menu 3',
          foodIngredientName: 'Ingredient 2',
          foodIngredientCode: 'I2',
          foodIngredientUnitPriceAmount: 5,
          foodIngredientAmount: 3,
          foodIngredientAmountUnit: 'g',
        },
      ];

      // when
      const result = service.mergeCommonRawFoodIngredientList(dtoList);

      // expect
      expect(result).toEqual([
        {
          name: 'Ingredient 2',
          unitPriceAmount: 5,
          cookQuantity: 3,
        },
      ]);
    });
  });
});
