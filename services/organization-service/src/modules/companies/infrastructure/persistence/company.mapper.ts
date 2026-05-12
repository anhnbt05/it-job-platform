import { Companies } from '@/modules/companies/entities';
import { Company } from '@/modules/companies/domain/company';

export class CompanyMapper {
  static toDomain(entity: Companies) {
    return Company.rehydrate({
      id: entity.id,
      name: entity.name,
      logo_url: entity.logo_url,
      location: entity.location,
      website: entity.website,
      size: entity.size,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(company: Company) {
    return Object.assign(new Companies(), company.toPrimitives());
  }
}
