import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Level } from 'generated/prisma/enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly full_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly phone_number?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;

  @IsOptional()
  @IsUrl()
  readonly avatar_url?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCandidateProfileDto)
  readonly updateCandidateDto?: UpdateCandidateProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRecruiterProfileDto)
  readonly updateRecruiterDto?: UpdateRecruiterProfileDto;
}

class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly headline?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly summary?: string[];

  @IsOptional()
  @IsEnum(Level)
  readonly level?: Level;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly resume_urls?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly skills?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly educations?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly certifications?: string[];
}

class UpdateRecruiterProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly department?: string;
}
