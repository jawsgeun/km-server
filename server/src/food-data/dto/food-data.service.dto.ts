import { BLD } from 'src/common/enums';

import { FoodDataDateRecentServedOrder } from './food-data.controller.dto';

export class GetFoodDataListDto {
  bld: BLD;
  dateFromYYYYMMDD: string;
  dateToYYYYMMDD: string;
  page: number;
  sizePerPage: number;
  operationBranchId: string;
  dateRecentServedOrder: FoodDataDateRecentServedOrder;
}
