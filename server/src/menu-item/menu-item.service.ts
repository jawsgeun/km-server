import _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItemNotFoundException } from 'src/exceptions';
import { Menu } from 'src/menu/entities/menu.entity';
import { FoodDataService } from 'src/food-data/services/food-data.service';

import { MenuItem } from './entities/menu-item.entity';
import { MenuItemMemo } from './entities/menu-item-memo.entity';
import { UpdateMemoAndCoverCountRequestBodyDto } from './dto/menu-item.controller.dto';
import {
  CreateManyMenuItemDto,
  FindAllMenuItemDto,
  UpdateMenuItemDto,
} from './dto/menu-item.service.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuItemMemo)
    private readonly menuItemMemoRepository: Repository<MenuItemMemo>,
    private readonly foodDataService: FoodDataService,
  ) {}

  async syncTotalRemainingAmount(menuItemId: number) {
    const menuItem = await this.menuItemRepository.findOne({
      relations: { foodIngredientList: true },
      where: { id: menuItemId },
    });
    if (!menuItem) {
      throw new MenuItemNotFoundException();
    }

    const foodIngredientFoodAmount = _.sumBy(
      menuItem.foodIngredientList,
      'remainingFoodAmount',
    );
    const foodIngredientPriceAmount = _.sumBy(
      menuItem.foodIngredientList,
      'remainingPriceAmount',
    );

    menuItem.totalRemainingFoodAmount =
      menuItem.remainingFoodAmount + foodIngredientFoodAmount;
    menuItem.totalRemainingPriceAmount =
      menuItem.remainingPriceAmount + foodIngredientPriceAmount;

    await this.menuItemRepository.save(menuItem);
  }

  async createMany(createMenuItemDto: CreateManyMenuItemDto) {
    const menuItemEntityList = createMenuItemDto.menuItemDtoList.map(
      (createMenuItemDto) => {
        const { menu } = createMenuItemDto;

        return this.menuItemRepository.create({
          ...createMenuItemDto,
          dateServed: menu.dateServed,
        });
      },
    );

    return this.menuItemRepository.save(menuItemEntityList);
  }

  async findAll(dto: FindAllMenuItemDto) {
    const { dateServed, bld, operationBranchId } = dto;
    return this.menuItemRepository
      .createQueryBuilder('menuItem')
      .innerJoin('menuItem.menu', 'menu')
      .leftJoinAndSelect('menuItem.foodIngredientList', 'foodIngredientList')
      .where('menu.dateServed = :dateServed', { dateServed })
      .andWhere('menu.bld = :bld', { bld })
      .andWhere('menu.operationBranchId = :operationBranchId', {
        operationBranchId,
      })
      .getMany();
  }

  async updateMenuItem(dto: UpdateMenuItemDto) {
    const { menuItemId, activated } = dto;
    const menuItem = await this.menuItemRepository
      .findOneByOrFail({
        id: menuItemId,
      })
      .catch(() => {
        throw new MenuItemNotFoundException();
      });

    menuItem.activated = activated;

    await this.menuItemRepository.save(menuItem);
  }

  async validateOperationBranchMenuItem(
    menuItemId: number,
    operationBranchId: number,
  ) {
    const menuItem = await this.menuItemRepository
      .findOneOrFail({
        relations: {
          menu: true,
        },
        where: { id: menuItemId },
      })
      .catch(() => {
        throw new MenuItemNotFoundException();
      });

    const menu = await this.menuRepository
      .findOneOrFail({
        relations: {
          operationBranch: true,
        },
        where: { id: menuItem.menu.id },
      })
      .catch(() => {
        throw new MenuItemNotFoundException();
      });

    if (menu.operationBranch.id !== operationBranchId) {
      throw new MenuItemNotFoundException();
    }
  }

  async updateMemoAndCoverCount(
    menuItemId: number,
    dto: UpdateMemoAndCoverCountRequestBodyDto,
  ) {
    const menuItem = await this.menuItemRepository.findOne({
      relations: {
        memoList: true,
        menu: true,
      },
      where: { id: menuItemId },
    });
    if (!menuItem) {
      throw new MenuItemNotFoundException();
    }

    const [menuItemMemo] = menuItem.memoList;

    if (!menuItemMemo) {
      const menuItemMemoEntity = this.menuItemMemoRepository.create({
        content: dto.memo || '',
      });
      menuItem.memoList = [menuItemMemoEntity];
    } else {
      menuItemMemo.content = dto.memo || '';
    }

    menuItem.menu.editedCoverCount = dto.editedCoverCount || null;

    const savedMenuItem = await this.menuItemRepository.save(menuItem);

    if (menuItem.foodDataId) {
      await this.foodDataService.refreshFoodDataHasMemo(menuItem.foodDataId);
    }

    return savedMenuItem;
  }
}
