import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { MenuNotFoundException } from 'src/exceptions';
import { MenuFactory } from 'test/factory';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MenuService } from './menu.service';
import { Menu } from './entities/menu.entity';
import { UpdateMenuEntityDto } from './dto/menu.service.dto';

const [dummyMenu] = MenuFactory.createMenu([{}]);
const mockMenuRepository = () => ({
  findOneByOrFail: jest.fn(),
  save: jest.fn(),
});

describe('MenuService', () => {
  let menuService: MenuService;
  let menuRepository: jest.Mocked<Repository<Menu>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(Menu),
          useValue: mockMenuRepository(),
        },
      ],
    }).compile();

    menuService = module.get(MenuService);
    menuRepository = module.get<jest.Mocked<Repository<Menu>>>(
      getRepositoryToken(Menu),
    );
  });

  describe('update', () => {
    it('메뉴를 조회해야한다', async () => {
      // given
      const givenId = 1;
      const givenDto: UpdateMenuEntityDto = {
        actualCoverCount: 1,
      };

      menuRepository.findOneByOrFail.mockResolvedValueOnce(dummyMenu!);

      // when
      await menuService.update(givenId, givenDto);

      // then
      expect(menuRepository.findOneByOrFail).toHaveBeenCalledTimes(1);
      expect(menuRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: givenId,
      });
    });

    it('메뉴를 찾을 수 없는 경우, MenuNotFoundException을 던져야한다', async () => {
      // given
      const givenId = 1;
      const givenDto: UpdateMenuEntityDto = {
        actualCoverCount: 1,
      };

      menuRepository.findOneByOrFail.mockRejectedValueOnce('unknown error');

      // when, then
      await expect(menuService.update(givenId, givenDto)).rejects.toThrow(
        MenuNotFoundException,
      );
    });

    it('메뉴를 업데이트 해야한다', async () => {
      // given
      const givenId = 1;
      const givenDto: UpdateMenuEntityDto = {
        actualCoverCount: dummyMenu!.actualCoverCount! + 10,
      };

      menuRepository.findOneByOrFail.mockResolvedValueOnce(dummyMenu!);

      // when
      await menuService.update(givenId, givenDto);

      // then
      const updateMenu = { ...dummyMenu, ...givenDto };
      expect(menuRepository.save).toHaveBeenCalledTimes(1);
      expect(menuRepository.save).toHaveBeenCalledWith(updateMenu);
    });
  });
});
