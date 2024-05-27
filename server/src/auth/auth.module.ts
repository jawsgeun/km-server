import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationBranch } from 'src/operation-branch/entities/operation-branch.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OperationBranch])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
