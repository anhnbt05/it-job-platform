import { Branches } from '@/modules/branches/entities';
import { Branch } from '@/modules/branches/domain/branch';
import { CompanyMapper } from '@/modules/companies/infrastructure/persistence/company.mapper';
import { Companies } from '@/modules/companies/entities';

export class BranchMapper {
  static toDomain(entity: Branches) {
    return Branch.rehydrate({
      id: entity.id,
      name: entity.name,
      address: entity.address,
      city: entity.city,
      country: entity.country,
      company: CompanyMapper.toDomain(entity.company).toPrimitives(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(branch: Branch) {
    const entity = Object.assign(new Branches(), {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      country: branch.country,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    });

    entity.company = Object.assign(new Companies(), branch.company);

    return entity;
  }
}
