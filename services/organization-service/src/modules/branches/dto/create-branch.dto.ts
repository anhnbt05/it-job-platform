export class CreateBranchDto {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly company_id: string,
    public readonly city?: string,
    public readonly country?: string,
  ) {}
}
