import {
  CreateBranchDto,
  CreateCompanyDto,
  UpdateBranchDto,
  UpdateCompanyDto,
} from '@/modules/companies/dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateCompanySnapshot(dto: UpdateCompanyDto) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.companySnapshot.update({
        where: {
          id: dto.id,
        },
        data: dto,
      });
    });
  }

  async createCompanySnapshot(dto: CreateCompanyDto) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.companySnapshot.create({
        data: dto,
      });
    });
  }

  async createBranchSnapshot(dto: CreateBranchDto) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.companyBranchSnapshot.create({
        data: dto,
      });
    });
  }

  async updateBranchSnapshot(dto: UpdateBranchDto) {
    await this.prismaService.$transaction(async (tx) => {
      await tx.companyBranchSnapshot.update({
        where: {
          id: dto.id,
        },
        data: dto,
      });
    });
  }
}
