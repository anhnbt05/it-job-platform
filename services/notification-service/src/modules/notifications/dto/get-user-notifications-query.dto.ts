import { NotificationType } from '@/common/enums';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class GetUserNotificationsQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly isRead?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  readonly type?: NotificationType;
}
