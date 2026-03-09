import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly country?: string;
}
