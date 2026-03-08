import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class MarkNotificationsAsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
  })
  readonly ids: string[];
}
