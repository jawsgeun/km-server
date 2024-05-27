import { BLD } from 'src/common/enums';

export class GetWeeklyMenuListDto {
  bld: BLD;
  dateFromYYYYMMDD: string;
  dateToYYYYMMDD: string;
  operationBranchId: number;
}
