import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteUserNotificationsQueryDto {
  @Transform(({ value }) => value.split(','))
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  readonly ids: string[];
}
