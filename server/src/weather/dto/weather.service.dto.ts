import { BLD } from 'src/common/enums';

export class FindAllWeatherDto {
  operationBranchId: number;
  dateFromYYYYMMDD: number;
  dateToYYYYMMDD: number;
  bld: BLD;
}
