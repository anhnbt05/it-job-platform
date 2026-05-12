import { Company } from './company';

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';

export interface FindCompanyByNameAndWebsiteCriteria {
  name: string;
  website: string;
}

export interface CompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
  findByNameAndWebsite(
    criteria: FindCompanyByNameAndWebsiteCriteria,
  ): Promise<Company | null>;
  save(company: Company): Promise<Company>;
}
