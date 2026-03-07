export class CreateCompanyDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly location: string,
    public readonly updated_at: Date,
    public readonly logo_url?: string,
  ) {}
}
