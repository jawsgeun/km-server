import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { FoodData } from 'src/food-data/entities/food-data.entity';

import { MenuItem } from './menu-item.entity';

@EventSubscriber()
export class MenuItemSubscriber implements EntitySubscriberInterface<MenuItem> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return MenuItem;
  }

  async beforeRemove(event: RemoveEvent<MenuItem>) {
    const menuItemId = event.entityId;
    const tagetFoodDataList = await event.manager
      .getRepository(FoodData)
      .findBy({
        maxCoverCountSiblingMenuItemId: menuItemId,
      });

    if (tagetFoodDataList.length === 0) {
      return;
    }

    for (const foodData of tagetFoodDataList) {
      foodData.maxCoverCountSiblingMenuItemId = null;
      foodData.maxCoverCount = 0;
    }

    await event.manager.getRepository(FoodData).save(tagetFoodDataList);
  }
}
