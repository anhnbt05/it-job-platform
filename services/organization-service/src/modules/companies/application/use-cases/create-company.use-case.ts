import { CreateCompanyDto } from '@/modules/companies/dto';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/company.repository';
import { Company } from '@/modules/companies/domain/company';
import {
  COMPANY_SNAPSHOT_PUBLISHER,
} from '../ports/company-snapshot.publisher.port';
import {
  COMPANY_MUTATION_TRACKER,
} from '../ports/company-mutation-tracker.port';
import { Inject, Injectable } from '@nestjs/common';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';
import type { CompanySnapshotPublisher } from '../ports/company-snapshot.publisher.port';
import type { CompanyMutationTracker } from '../ports/company-mutation-tracker.port';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_SNAPSHOT_PUBLISHER)
    private readonly companySnapshotPublisher: CompanySnapshotPublisher,
    @Inject(COMPANY_MUTATION_TRACKER)
    private readonly companyMutationTracker: CompanyMutationTracker,
  ) {}

  async execute(dto: CreateCompanyDto) {
    let company = await this.companyRepository.findByName(dto.name);

    if (!company) {
      company = Company.create({
        name: dto.name,
        location: dto.location,
        size: dto.size,
        logo_url: dto.logo_url,
        website: dto.website,
      });

      company = await this.companyRepository.save(company);
    }

    await this.companySnapshotPublisher.publishCreated(company);
    this.companyMutationTracker.trackCreate();

    return company;
  }
}
