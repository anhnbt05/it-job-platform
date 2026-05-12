import { UpdateCompanyDto } from '@/modules/companies/dto';
import { COMPANY_REPOSITORY } from '@/modules/companies/domain/company.repository';
import {
  COMPANY_SNAPSHOT_PUBLISHER,
} from '../ports/company-snapshot.publisher.port';
import {
  COMPANY_MUTATION_TRACKER,
} from '../ports/company-mutation-tracker.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CompanyRepository } from '@/modules/companies/domain/company.repository';
import type { CompanySnapshotPublisher } from '../ports/company-snapshot.publisher.port';
import type { CompanyMutationTracker } from '../ports/company-mutation-tracker.port';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_SNAPSHOT_PUBLISHER)
    private readonly companySnapshotPublisher: CompanySnapshotPublisher,
    @Inject(COMPANY_MUTATION_TRACKER)
    private readonly companyMutationTracker: CompanyMutationTracker,
  ) {}

  async execute(id: string, dto: UpdateCompanyDto) {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException('Không tìm thấy thông tin công ty.');
    }

    company.update(dto);

    const savedCompany = await this.companyRepository.save(company);

    await this.companySnapshotPublisher.publishUpdated(savedCompany);
    this.companyMutationTracker.trackUpdate();

    return {
      success: true,
      message: 'Đã cập nhật thành công thông tin công ty.',
    };
  }
}
