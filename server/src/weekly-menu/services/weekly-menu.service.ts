import { Injectable } from '@nestjs/common';
import { Menu } from 'src/menu/entities/menu.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { WeeklyMenuResponseDto } from '../dto/weekly-menu.controller.dto';
import { GetWeeklyMenuListDto } from '../dto/weekly-menu.service.dto';

@Injectable()
export class WeeklyMenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}
  async getWeeklyMenuList(
    dto: GetWeeklyMenuListDto,
  ): Promise<WeeklyMenuResponseDto[]> {
    const { dateFromYYYYMMDD, dateToYYYYMMDD, bld, operationBranchId } = dto;
    const menuList = await this.menuRepository.find({
      relations: {
        menuItemList: true,
      },
      where: {
        operationBranch: {
          id: operationBranchId,
        },
        bld,
        dateServed: Between(Number(dateFromYYYYMMDD), Number(dateToYYYYMMDD)),
      },
      order: {
        dateServed: 'ASC',
        order: 'ASC',
      },
    });

    const menuListWithActivated = menuList.map((menu) => {
      const activatedMenuItemList = menu.menuItemList.filter(
        (menuItem) => menuItem.activated,
      );
      return {
        ...menu,
        menuItemList: activatedMenuItemList,
      };
    });

    return menuListWithActivated.map(WeeklyMenuResponseDto.of);
  }
}
