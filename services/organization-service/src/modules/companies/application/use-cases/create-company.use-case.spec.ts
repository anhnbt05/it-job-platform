import { CreateCompanyUseCase } from './create-company.use-case';
import { Company } from '@/modules/companies/domain/company';

describe('CreateCompanyUseCase', () => {
  it('creates a new company when the name does not exist', async () => {
    const save = jest
      .fn()
      .mockImplementation(async (company: Company) =>
        Company.rehydrate({
          ...company.toPrimitives(),
          id: 'company-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );
    const companyRepository = {
      findByName: jest.fn().mockResolvedValue(null),
      save,
    };
    const companySnapshotPublisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const companyMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateCompanyUseCase(
      companyRepository as never,
      companySnapshotPublisher as never,
      companyMutationTracker as never,
    );

    const company = await useCase.execute({
      name: 'Acme',
      location: 'HCM',
      website: 'https://acme.test',
      size: 100,
    });

    expect(companyRepository.findByName).toHaveBeenCalledWith('Acme');
    expect(save).toHaveBeenCalledTimes(1);
    expect(companySnapshotPublisher.publishCreated).toHaveBeenCalledWith(company);
    expect(companyMutationTracker.trackCreate).toHaveBeenCalled();
    expect(company.toPrimitives()).toMatchObject({
      id: 'company-1',
      name: 'Acme',
      location: 'HCM',
      website: 'https://acme.test',
      size: 100,
    });
  });

  it('reuses the existing company when the name already exists', async () => {
    const existingCompany = Company.rehydrate({
      id: 'company-2',
      name: 'Acme',
      location: 'Da Nang',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    const companyRepository = {
      findByName: jest.fn().mockResolvedValue(existingCompany),
      save: jest.fn(),
    };
    const companySnapshotPublisher = {
      publishCreated: jest.fn().mockResolvedValue(undefined),
    };
    const companyMutationTracker = {
      trackCreate: jest.fn(),
    };
    const useCase = new CreateCompanyUseCase(
      companyRepository as never,
      companySnapshotPublisher as never,
      companyMutationTracker as never,
    );

    const company = await useCase.execute({
      name: 'Acme',
      location: 'HCM',
    });

    expect(companyRepository.save).not.toHaveBeenCalled();
    expect(companySnapshotPublisher.publishCreated).toHaveBeenCalledWith(
      existingCompany,
    );
    expect(companyMutationTracker.trackCreate).toHaveBeenCalled();
    expect(company).toBe(existingCompany);
  });
});
