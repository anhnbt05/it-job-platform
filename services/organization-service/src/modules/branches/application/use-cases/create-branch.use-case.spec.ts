import { CreateBranchUseCase } from './create-branch.use-case';
import { Branch } from '@/modules/branches/domain/branch';
import { Company } from '@/modules/companies/domain/company';
import { NotFoundException } from '@nestjs/common';

describe('CreateBranchUseCase', () => {
  it('creates a branch for an existing company', async () => {
    const company = Company.rehydrate({
      id: 'company-1',
      name: 'Acme',
      location: 'HCM',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const save = jest
      .fn()
      .mockImplementation(async (branch: Branch) =>
        Branch.rehydrate({
          ...branch.toPrimitives(),
          id: 'branch-1',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        }),
      );
    const branchRepository = {
      save,
    };
    const companyRepository = {
      findById: jest.fn().mockResolvedValue(company),
    };
    const branchSnapshotPublisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const branchMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateBranchUseCase(
      branchRepository as never,
      companyRepository as never,
      branchSnapshotPublisher as never,
      branchMutationTracker as never,
    );

    const branch = await useCase.execute({
      name: 'Branch 1',
      address: '123 Street',
      city: 'HCM',
      country: 'VN',
      company_id: 'company-1',
    });

    expect(companyRepository.findById).toHaveBeenCalledWith('company-1');
    expect(save).toHaveBeenCalledTimes(1);
    expect(branchSnapshotPublisher.publishCreated).toHaveBeenCalledWith(branch);
    expect(branchMutationTracker.trackCreate).toHaveBeenCalled();
    expect(branch.toPrimitives()).toMatchObject({
      id: 'branch-1',
      name: 'Branch 1',
      address: '123 Street',
      city: 'HCM',
      country: 'VN',
      company: {
        id: 'company-1',
        name: 'Acme',
      },
    });
  });

  it('throws when the company does not exist', async () => {
    const branchRepository = {
      save: jest.fn(),
    };
    const companyRepository = {
      findById: jest.fn().mockResolvedValue(null),
    };
    const branchSnapshotPublisher = {
      publishCreated: jest.fn(),
    };
    const branchMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateBranchUseCase(
      branchRepository as never,
      companyRepository as never,
      branchSnapshotPublisher as never,
      branchMutationTracker as never,
    );

    await expect(
      useCase.execute({
        name: 'Branch 1',
        address: '123 Street',
        company_id: 'missing-company',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(branchRepository.save).not.toHaveBeenCalled();
    expect(branchSnapshotPublisher.publishCreated).not.toHaveBeenCalled();
    expect(branchMutationTracker.trackCreate).not.toHaveBeenCalled();
  });
});
