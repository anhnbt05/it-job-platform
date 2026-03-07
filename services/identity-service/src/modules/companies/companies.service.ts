import { CreateBranchDto, CreateCompanyDto } from '@/modules/companies/dto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
