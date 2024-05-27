import { BLD } from 'src/common/enums';

export class FindAllByDateServedDto {
  branchCode: string;
  dateServed: number;
}

export class FindAllRawMenuItemDto {
  dateServed: number;
  bld: BLD;
  operationBranchId: number;
}
