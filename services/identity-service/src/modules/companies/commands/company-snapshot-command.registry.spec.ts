import { CompanySnapshotCommandRegistry } from './company-snapshot-command.registry';
import { CompanySnapshotEvent } from './company-snapshot-command.interface';
import { CompanySnapshotCommand } from './company-snapshot-command.interface';

describe('CompanySnapshotCommandRegistry', () => {
  const createCompanyCommand: CompanySnapshotCommand = {
    event: CompanySnapshotEvent.COMPANY_CREATED,
    execute: jest.fn().mockResolvedValue(undefined),
  };
  const updateCompanyCommand: CompanySnapshotCommand = {
    event: CompanySnapshotEvent.COMPANY_UPDATED,
    execute: jest.fn().mockResolvedValue(undefined),
  };
  const createBranchCommand: CompanySnapshotCommand = {
    event: CompanySnapshotEvent.BRANCH_CREATED,
    execute: jest.fn().mockResolvedValue(undefined),
  };
  const updateBranchCommand: CompanySnapshotCommand = {
    event: CompanySnapshotEvent.BRANCH_UPDATED,
    execute: jest.fn().mockResolvedValue(undefined),
  };

  const registry = new CompanySnapshotCommandRegistry(
    createCompanyCommand as any,
    updateCompanyCommand as any,
    createBranchCommand as any,
    updateBranchCommand as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches the payload to the matching command', async () => {
    const payload = { id: 'company-1' };

    await registry.dispatch(CompanySnapshotEvent.COMPANY_UPDATED, payload);

    expect(updateCompanyCommand.execute).toHaveBeenCalledWith(payload);
    expect(createCompanyCommand.execute).not.toHaveBeenCalled();
  });

  it('throws when no command is registered for an event', async () => {
    await expect(
      registry.dispatch('unknown.event' as CompanySnapshotEvent, {}),
    ).rejects.toThrow('No command handler registered for event: unknown.event');
  });
});
