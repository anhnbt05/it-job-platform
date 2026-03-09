import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly logo_url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly location?: string;

  @IsOptional()
  @IsUrl()
  readonly website?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly size?: number;
}
