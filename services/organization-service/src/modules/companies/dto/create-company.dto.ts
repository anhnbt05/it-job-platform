export class CreateCompanyDto {
  constructor(
    public readonly name: string,
    public readonly location: string,
    public readonly size?: number,
    public readonly logo_url?: string,
    public readonly description?: string,
    public readonly website?: string,
  ) {}
}
