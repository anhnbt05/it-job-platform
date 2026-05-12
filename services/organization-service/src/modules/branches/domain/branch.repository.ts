import { Branch } from './branch';

export const BRANCH_REPOSITORY = 'BRANCH_REPOSITORY';

export interface BranchRepository {
  findAll(companyId?: string): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  save(branch: Branch): Promise<Branch>;
}
