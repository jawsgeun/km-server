import { CompanyName } from '../entities/operation-branch.entity';

export class CreateOperationBranchDto {
  companyName: CompanyName;
  name: string;
  code: string;
  loginCode: string;
  latitude: number;
  longitude: number;
}
