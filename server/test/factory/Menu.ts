import { BLD } from 'src/common/enums';
import { MenuItem } from 'src/menu-item/entities/menu-item.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';
import { RawMenu } from 'src/raw-food/entities/raw-menu.entity';

type MenuCreationInput = Partial<Menu>;

export class MenuFactory {
  static createMenu(inputList: MenuCreationInput[]): Menu[] {
    return inputList.map((input) => {
      const menu = new Menu();
      menu.name = input.name || '닭볶음탕';
      menu.bld = input.bld || BLD.B;
      menu.order = input.order || 1;
      menu.expectedCoverCount = input.expectedCoverCount || 100;
      menu.actualCoverCount = input.actualCoverCount || 100;
      menu.editedCoverCount = input.editedCoverCount || 100;
      menu.dateServed = input.dateServed || 20240220;
      menu.operationBranch = input.operationBranch || new OperationBranch();
      menu.menuItemList = input.menuItemList || [new MenuItem()];
      menu.rawMenu = input.rawMenu || new RawMenu();
      return menu;
    });
  }
}
