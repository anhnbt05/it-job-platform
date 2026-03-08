import { NotificationType } from '@/common/enums';
import { UserNotifications } from '@/modules/notifications/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    unique: true,
  })
  title: string;

  @Column({
    unique: true,
    enum: NotificationType,
  })
  type: NotificationType;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => UserNotifications, (un) => un.notification, {
    cascade: true,
  })
  userNotifications: UserNotifications[];
}
