import { Injectable } from '@nestjs/common';
import { LessThanOrEqual, Repository } from 'typeorm';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FoodIngredientNotFoundException,
  MenuItemNotFoundException,
} from 'src/exceptions';
import { convertToPaginationDto } from 'src/common/dto';
import { formatYYYYMMDD } from 'src/common';
import { Menu } from 'src/menu/entities/menu.entity';
import _ from 'lodash';
import { FoodIngredient } from 'src/food-ingredient/entities/food-ingredient.entity';
import { Weather } from 'src/weather/entities/weather.entity';
import { DEFAULT_WEATHER_ICON } from 'src/constants/weather';

import {
  CalulateServingSizeReductionDto,
  CalulateServingSizeSuggestionDto,
  ConvertToMealServiceFoodIngredientDtoDto,
  ConvertToMealServiceMenuItemDtoDto,
  GetMealServiceResultDetailDto,
  GetMealServiceResultFoodIngredientDetailInput,
  GetMealServiceResultListDto,
  GetMealServiceResultMenuItemDetailInput,
  GetServingSizeProperLevelDto,
  GetSiblingMenuListDto,
  MealServiceResultType,
} from '../dto/meal-service-result.service.dto';
import {
  GetMealServiceResultListResponseDto,
  MealServiceDetailSiblingMenuResponseDto,
  MealServiceFoodIngredientResponseDto,
  MealServiceMenuItemResponseDto,
  MealServiceResultDetailResponseDto,
  ServingSizeProperLevel,
} from '../dto/meal-service-result.controller.dto';

@Injectable()
export class MealServiceResultService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(FoodIngredient)
    private readonly foodIngredientRepository: Repository<FoodIngredient>,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

  async getMealServiceResultList(
    dto: GetMealServiceResultListDto,
  ): Promise<GetMealServiceResultListResponseDto> {
    const { foodDataId, page, sizePerPage } = dto;

    const skipCount = (page - 1) * sizePerPage;

    const currentDateYYYYMMDD = formatYYYYMMDD(new Date());

    const [menuItemList, menuItemListCount] =
      await this.menuItemRepository.findAndCount({
        relations: {
          menu: true,
          foodIngredientList: true,
          memoList: true,
        },
        where: {
          foodDataId,
          dateServed: LessThanOrEqual(Number(currentDateYYYYMMDD)),
        },
        order: {
          menu: { dateServed: 'DESC' },
          remainingFoodAmount: 'DESC',
        },
        skip: skipCount,
        take: sizePerPage,
      });

    return {
      data: menuItemList.map((menuItem) =>
        this.convertToMealServiceMenuItemDto({
          menu: menuItem.menu,
          menuItem,
        }),
      ),
      pagination: convertToPaginationDto(menuItemListCount, page, sizePerPage),
    };
  }

  private convertToMealServiceMenuItemDto(
    dto: ConvertToMealServiceMenuItemDtoDto,
  ): MealServiceMenuItemResponseDto {
    const { menu, menuItem } = dto;
    const servingSizeSuggestion = this.calulateServingSizeSuggestion({
      servingSize: menuItem.servingSize,
      remainingFoodAmount: menuItem.remainingFoodAmount,
      actualCoverCount: menu.actualCoverCount,
      expectedCoverCount: menu.expectedCoverCount,
      editedCoverCount: menu.editedCoverCount,
    });

    const servingSizeReduction = servingSizeSuggestion
      ? this.calulateServingSizeReduction({
          servingSize: menuItem.servingSize,
          servingSizeSuggestion,
          actualCoverCount: menu.actualCoverCount,
        })
      : null;

    const servingSizeProperLevel = servingSizeReduction
      ? this.getServingSizeProperLevel({
          servingSize: menuItem.servingSize,
          servingSizeReduction,
        })
      : ServingSizeProperLevel.PROPER;

    return {
      id: String(menuItem.id),
      name: menuItem.name,
      dateServed: menu.dateServed,
      cornerName: menu.name,
      servingSizeProperLevel,
      servingSize: menuItem.servingSize,
      servingSizeSuggestion,
      servingSizeReduction,
      remainingFoodAmount: menuItem.remainingFoodAmount,
      expectedCoverCount: menu.expectedCoverCount,
      actualCoverCount: menu.actualCoverCount,
      hasMemo: Boolean(menuItem.memoList.length),
      foodIngredientList: menuItem.foodIngredientList.map((foodIngredient) =>
        this.convertToMealServiceFoodIngredientDto({
          foodIngredient,
          menu,
        }),
      ),
    };
  }

  private convertToMealServiceFoodIngredientDto(
    dto: ConvertToMealServiceFoodIngredientDtoDto,
  ): MealServiceFoodIngredientResponseDto {
    const { foodIngredient, menu } = dto;
    const servingSizeSuggestion = this.calulateServingSizeSuggestion({
      servingSize: foodIngredient.servingSize,
      remainingFoodAmount: foodIngredient.remainingFoodAmount,
      actualCoverCount: menu.actualCoverCount,
      expectedCoverCount: menu.expectedCoverCount,
      editedCoverCount: menu.editedCoverCount,
    });

    const servingSizeReduction = servingSizeSuggestion
      ? this.calulateServingSizeReduction({
          servingSize: foodIngredient.servingSize,
          servingSizeSuggestion,
          actualCoverCount: menu.actualCoverCount,
        })
      : null;

    const servingSizeProperLevel = servingSizeReduction
      ? this.getServingSizeProperLevel({
          servingSize: foodIngredient.servingSize,
          servingSizeReduction,
        })
      : ServingSizeProperLevel.PROPER;

    return {
      id: String(foodIngredient.id),
      name: foodIngredient.name,
      dateServed: menu.dateServed,
      cornerName: menu.name,
      servingSizeProperLevel,
      servingSize: foodIngredient.servingSize,
      servingSizeSuggestion,
      servingSizeReduction,
      remainingFoodAmount: foodIngredient.remainingFoodAmount,
      expectedCoverCount: menu.expectedCoverCount,
      actualCoverCount: menu.actualCoverCount,
      hasMemo: false,
    };
  }

  private calulateServingSizeSuggestion(dto: CalulateServingSizeSuggestionDto) {
    const {
      servingSize,
      actualCoverCount,
      expectedCoverCount,
      editedCoverCount,
      remainingFoodAmount,
    } = dto;

    if (!actualCoverCount) {
      return null;
    }

    if (!expectedCoverCount) {
      return null;
    }

    const targetCoverCount = editedCoverCount || expectedCoverCount;

    const servingSizeSuggestion = Math.round(
      (targetCoverCount * servingSize - remainingFoodAmount) / actualCoverCount,
    );

    if (servingSizeSuggestion > servingSize - 0.5) {
      return null;
    }

    if (servingSizeSuggestion <= 0) {
      return null;
    }

    return servingSizeSuggestion;
  }

  private calulateServingSizeReduction(dto: CalulateServingSizeReductionDto) {
    const { servingSize, servingSizeSuggestion, actualCoverCount } = dto;
    if (!actualCoverCount) {
      return null;
    }

    const servingSizeReduction = Math.round(
      servingSize - servingSizeSuggestion,
    );

    if (servingSizeReduction < 0.5) {
      return null;
    }

    return servingSizeReduction;
  }

  private getServingSizeProperLevel(dto: GetServingSizeProperLevelDto) {
    const { servingSizeReduction, servingSize } = dto;

    if (servingSizeReduction / servingSize >= 0.05) {
      return ServingSizeProperLevel.NEED_MODIFY;
    }

    return ServingSizeProperLevel.PROPER;
  }

  async getMealServiceResultDetail(
    dto: GetMealServiceResultDetailDto,
  ): Promise<MealServiceResultDetailResponseDto> {
    const { mealServiceResultId, type, operationBranchId } = dto;
    switch (type) {
      case MealServiceResultType.MENU_ITEM: {
        return this.getMealServiceResultMenuItemDetail({
          menuItemId: mealServiceResultId,
          operationBranchId,
        });
      }
      case MealServiceResultType.FOOD_INGREDIENT: {
        return this.getMealServiceResultFoodIngredientDetail({
          foodIngredientId: mealServiceResultId,
          operationBranchId,
        });
      }
    }
  }

  private async getMealServiceResultMenuItemDetail(
    input: GetMealServiceResultMenuItemDetailInput,
  ): Promise<MealServiceResultDetailResponseDto> {
    const { menuItemId, operationBranchId } = input;
    const menuItem = await this.menuItemRepository
      .findOneOrFail({
        relations: { memoList: true, menu: true },
        where: { id: menuItemId },
      })
      .catch(() => {
        throw new MenuItemNotFoundException();
      });

    const [menuItemMemo] = menuItem.memoList;

    const siblingMenuList = await this.getSiblingMenuList({
      operationBranchId,
      bld: menuItem.menu.bld,
      dateServed: menuItem.menu.dateServed,
    });

    const weather = await this.weatherRepository.findOneBy({
      operationBranchId,
      dateYmd: menuItem.menu.dateServed,
      bld: menuItem.menu.bld,
    });

    return {
      bld: menuItem.menu.bld,
      dateServed: menuItem.menu.dateServed,
      weatherIcon: weather?.weatherIcon || DEFAULT_WEATHER_ICON,
      cornerName: menuItem.menu.name,
      expectedCoverCount: menuItem.menu.expectedCoverCount,
      actualCoverCount: menuItem.menu.actualCoverCount,
      editedCoverCount: menuItem.menu.editedCoverCount,
      name: menuItem.name,
      remainingFoodAmount: menuItem.remainingFoodAmount,
      siblingMenuList,
      memo: menuItemMemo
        ? {
            content: menuItemMemo.content,
            dateCreated: formatYYYYMMDD(menuItemMemo.dateCreated),
          }
        : null,
    };
  }

  private async getMealServiceResultFoodIngredientDetail(
    input: GetMealServiceResultFoodIngredientDetailInput,
  ): Promise<MealServiceResultDetailResponseDto> {
    const { foodIngredientId, operationBranchId } = input;
    const foodIngredient = await this.foodIngredientRepository
      .findOneOrFail({
        relations: { menuItem: true },
        where: { id: foodIngredientId },
      })
      .catch(() => {
        throw new FoodIngredientNotFoundException();
      });

    const menuItem = await this.menuItemRepository
      .findOneOrFail({
        relations: {
          menu: true,
        },
        where: {
          id: foodIngredient.menuItem.id,
        },
      })
      .catch(() => {
        throw new MenuItemNotFoundException();
      });

    const siblingMenuList = await this.getSiblingMenuList({
      operationBranchId,
      bld: menuItem.menu.bld,
      dateServed: menuItem.menu.dateServed,
    });

    const weather = await this.weatherRepository.findOneBy({
      operationBranchId,
      dateYmd: menuItem.menu.dateServed,
      bld: menuItem.menu.bld,
    });

    return {
      bld: menuItem.menu.bld,
      dateServed: menuItem.menu.dateServed,
      weatherIcon: weather?.weatherIcon || DEFAULT_WEATHER_ICON,
      cornerName: menuItem.menu.name,
      expectedCoverCount: menuItem.menu.expectedCoverCount,
      actualCoverCount: menuItem.menu.actualCoverCount,
      editedCoverCount: menuItem.menu.editedCoverCount,
      name: foodIngredient.name,
      remainingFoodAmount: foodIngredient.remainingFoodAmount,
      siblingMenuList,
      memo: null,
    };
  }

  private async getSiblingMenuList(
    dto: GetSiblingMenuListDto,
  ): Promise<MealServiceDetailSiblingMenuResponseDto[]> {
    const { dateServed, bld } = dto;
    const menuList = await this.menuRepository.find({
      relations: {
        menuItemList: true,
      },
      where: {
        dateServed,
        bld,
        operationBranch: {
          id: dto.operationBranchId,
        },
      },
    });

    return menuList.map((menu) => {
      return {
        cornerName: menu.name,
        menuItemList: menu.menuItemList.map((menuItem) =>
          _.pick(menuItem, ['name', 'remainingFoodAmount']),
        ),
      };
    });
  }
}
