import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { FoodData } from 'src/food-data/entities/food-data.entity';
import { MenuItemNotFoundException } from 'src/exceptions';

import { WeeklyMenuItemDetailResponseDto } from '../dto/weekly-menu-item.controller.dto';

@Injectable()
export class WeeklyMenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(FoodData)
    private readonly foodDataRepository: Repository<FoodData>,
  ) {}
  async getWeeklyMenuItem(
    menuItemId: number,
  ): Promise<WeeklyMenuItemDetailResponseDto> {
    const menuItem = await this.menuItemRepository.findOne({
      relations: {
        menu: true,
        foodIngredientList: true,
        memoList: true,
      },
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new MenuItemNotFoundException();
    }

    if (!menuItem.foodDataId) {
      return WeeklyMenuItemDetailResponseDto.of(menuItem);
    }

    const foodData = await this.foodDataRepository.findOneBy({
      id: menuItem.foodDataId,
    });

    if (!foodData) {
      return WeeklyMenuItemDetailResponseDto.of(menuItem);
    }

    if (!foodData.maxCoverCountSiblingMenuItemId) {
      return WeeklyMenuItemDetailResponseDto.of({ ...menuItem, foodData });
    }

    const siblingMenuItem = await this.menuItemRepository.findOneBy({
      id: foodData.maxCoverCountSiblingMenuItemId,
    });

    return WeeklyMenuItemDetailResponseDto.of({
      ...menuItem,
      foodData: {
        ...foodData,
        siblingMenuItemName: siblingMenuItem?.name,
      },
    });
  }
}
