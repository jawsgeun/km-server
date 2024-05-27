import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MenuNotFoundException } from 'src/exceptions';

import { Menu } from './entities/menu.entity';
import {
  GetMenuListDto,
  UpdateMenuDto,
  UpdateMenuEntityDto,
} from './dto/menu.service.dto';
import { MenuResponseDto } from './dto/menu.controller.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async getMenuList(dto: GetMenuListDto) {
    const { dateFromYYYYMMDD, dateToYYYYMMDD, operationBranchId } = dto;
    const menuList = await this.menuRepository.find({
      relations: {
        menuItemList: true,
      },
      where: {
        operationBranch: {
          id: operationBranchId,
        },
        dateServed: Between(Number(dateFromYYYYMMDD), Number(dateToYYYYMMDD)),
      },
    });

    return menuList.map(MenuResponseDto.of);
  }

  async updateMenu(dto: UpdateMenuDto) {
    const { menuId, order, cornerName } = dto;
    const menu = await this.menuRepository
      .findOneByOrFail({
        id: menuId,
      })
      .catch(() => {
        throw new MenuNotFoundException();
      });

    menu.order = order;
    menu.name = cornerName;

    await this.menuRepository.save(menu);
  }

  async update(id: number, dto: UpdateMenuEntityDto) {
    const menu = await this.menuRepository
      .findOneByOrFail({
        id,
      })
      .catch(() => {
        throw new MenuNotFoundException();
      });

    Object.assign(menu, dto);

    await this.menuRepository.save(menu);
  }
}
