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
      const existing = await tx.companySnapshot.findUnique({
        where: { id: dto.id },
      });

      if (this.isStaleSnapshot(existing?.updated_at, dto.updated_at)) {
        return;
      }

      await tx.companySnapshot.upsert({
        where: { id: dto.id },
        create: {
          id: dto.id,
          name: dto.name,
          location: dto.location,
          logo_url: dto.logo_url,
          updated_at: new Date(dto.updated_at),
        },
        update: {
          name: dto.name,
          location: dto.location,
          logo_url: dto.logo_url,
          updated_at: new Date(dto.updated_at),
        },
      });
    });
  }

  async createCompanySnapshot(dto: CreateCompanyDto) {
    await this.prismaService.$transaction(async (tx) => {
      const existing = await tx.companySnapshot.findUnique({
        where: { id: dto.id },
      });

      if (this.isStaleSnapshot(existing?.updated_at, dto.updated_at)) {
        return;
      }

      await tx.companySnapshot.upsert({
        where: { id: dto.id },
        create: {
          id: dto.id,
          name: dto.name,
          location: dto.location,
          logo_url: dto.logo_url,
          updated_at: new Date(dto.updated_at),
        },
        update: {
          name: dto.name,
          location: dto.location,
          logo_url: dto.logo_url,
          updated_at: new Date(dto.updated_at),
        },
      });
    });
  }

  async createBranchSnapshot(dto: CreateBranchDto) {
    await this.prismaService.$transaction(async (tx) => {
      const existing = await tx.companyBranchSnapshot.findUnique({
        where: { id: dto.id },
      });

      if (this.isStaleSnapshot(existing?.updated_at, dto.updated_at)) {
        return;
      }

      await tx.companyBranchSnapshot.upsert({
        where: { id: dto.id },
        create: {
          id: dto.id,
          company_id: dto.company_id,
          name: dto.name,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          updated_at: new Date(dto.updated_at),
        },
        update: {
          company_id: dto.company_id,
          name: dto.name,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          updated_at: new Date(dto.updated_at),
        },
      });
    });
  }

  async updateBranchSnapshot(dto: UpdateBranchDto) {
    await this.prismaService.$transaction(async (tx) => {
      const existing = await tx.companyBranchSnapshot.findUnique({
        where: { id: dto.id },
      });

      if (this.isStaleSnapshot(existing?.updated_at, dto.updated_at)) {
        return;
      }

      await tx.companyBranchSnapshot.upsert({
        where: { id: dto.id },
        create: {
          id: dto.id,
          company_id: dto.company_id,
          name: dto.name,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          updated_at: new Date(dto.updated_at),
        },
        update: {
          company_id: dto.company_id,
          name: dto.name,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          updated_at: new Date(dto.updated_at),
        },
      });
    });
  }

  private isStaleSnapshot(
    currentUpdatedAt: Date | undefined,
    incomingUpdatedAt: Date,
  ) {
    return (
      currentUpdatedAt !== undefined &&
      new Date(incomingUpdatedAt).getTime() < currentUpdatedAt.getTime()
    );
  }
}
