import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'generated/prisma/enums';

export class UpdateStatusOfUserDto {
  @IsEnum(UserStatus)
  readonly status: UserStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly reason?: string;
}
