export class CreateBranchDto {
  constructor(
    public readonly id: string,
    public readonly company_id: string,
    public readonly name: string,
    public readonly updated_at: Date,
    public readonly city?: string,
    public readonly country?: string,
    public readonly address?: string,
  ) {}
}
