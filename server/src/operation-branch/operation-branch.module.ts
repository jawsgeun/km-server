import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

import { OperationBranch } from './entities/operation-branch.entity';
import { OperationBranchService } from './services/operation-branch.service';
import { OperationBranchManager } from './entities/operation-branch-manager.entity';
import { OperationBranchController } from './controllers/operation-branch.controller';
import { OperationBranchManagerController } from './controllers/operation-branch-manager.controller';
import { OperationBranchManagerService } from './services/operation-branch-manager.service';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([OperationBranch, OperationBranchManager]),
  ],
  providers: [OperationBranchService, OperationBranchManagerService],
  controllers: [OperationBranchController, OperationBranchManagerController],
  exports: [OperationBranchService],
})
export class OperationBranchModule {}
