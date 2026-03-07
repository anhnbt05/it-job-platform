import { Branches } from '@/modules/branches/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Companies } from '@/modules/companies/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Branches, Companies])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
