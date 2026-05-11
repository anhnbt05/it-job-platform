import { Injectable } from '@nestjs/common';
import { CreateBranchSnapshotCommand } from './create-branch-snapshot.command';
import { CreateCompanySnapshotCommand } from './create-company-snapshot.command';
import {
  CompanySnapshotCommand,
  CompanySnapshotEvent,
} from './company-snapshot-command.interface';
import { UpdateBranchSnapshotCommand } from './update-branch-snapshot.command';
import { UpdateCompanySnapshotCommand } from './update-company-snapshot.command';

@Injectable()
export class CompanySnapshotCommandRegistry {
  private readonly commands: Map<CompanySnapshotEvent, CompanySnapshotCommand>;

  constructor(
    createCompanySnapshotCommand: CreateCompanySnapshotCommand,
    updateCompanySnapshotCommand: UpdateCompanySnapshotCommand,
    createBranchSnapshotCommand: CreateBranchSnapshotCommand,
    updateBranchSnapshotCommand: UpdateBranchSnapshotCommand,
  ) {
    this.commands = new Map(
      [
        createCompanySnapshotCommand,
        updateCompanySnapshotCommand,
        createBranchSnapshotCommand,
        updateBranchSnapshotCommand,
      ].map((command) => [command.event, command]),
    );
  }

  async dispatch<TPayload>(
    event: CompanySnapshotEvent,
    payload: TPayload,
  ): Promise<void> {
    const command = this.commands.get(event);

    if (!command) {
      throw new Error(`No command handler registered for event: ${event}`);
    }

    await command.execute(payload);
  }
}
