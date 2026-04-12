import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsUUID()
  readonly company_id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly country?: string;
}
