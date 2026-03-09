import { RoleEnum } from '@/common/enums';
import { IsEnum, IsOptional } from 'class-validator';

export class GetUsersQueryDto {
  @IsOptional()
  @IsEnum(RoleEnum)
  readonly role?: RoleEnum;
}
