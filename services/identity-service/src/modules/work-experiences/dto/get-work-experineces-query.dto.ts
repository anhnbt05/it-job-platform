import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobType } from 'generated/prisma/enums';

export class GetWorkExperiencesQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly company_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly position?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly start_date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly end_date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly location?: string;

  @IsOptional()
  @IsEnum(JobType)
  readonly job_type?: JobType;
}
