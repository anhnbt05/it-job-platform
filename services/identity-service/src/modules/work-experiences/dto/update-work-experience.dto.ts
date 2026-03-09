import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { JobType } from 'generated/prisma/enums';

export class UpdateWorkExperienceDto {
  @IsString()
  @IsNotEmpty()
  readonly company_name: string;

  @IsOptional()
  @IsString()
  readonly company_logo_url?: string;

  @IsString()
  @IsNotEmpty()
  readonly position: string;

  @IsArray()
  @IsString({ each: true })
  readonly descriptions: string[];

  @IsDateString()
  readonly start_date: string;

  @IsOptional()
  @IsDateString()
  readonly end_date?: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsEnum(JobType)
  readonly job_type: JobType;
}
