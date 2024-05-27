import { BLD } from 'src/common/enums';

export class FindAllWithMenuItemListDto {
  branchCode: string;
  dateServed: number;
}

export class CreateRawMenuDto {
  name: string;
  bld: BLD;
  expectedCoverCount: number;
  actualCoverCount: number;
  dateServed: number;
}

export class UpdateRawMenuDto {
  id: number;
  name: string;
  bld: string;
  expectedCoverCount: number;
  actualCoverCount: number;
  dateServed: number;
}
