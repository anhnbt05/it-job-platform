import { Notifications } from '@/modules/notifications/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index('IDX_user_notifications_user_created_at', ['userId', 'createdAt'])
@Index('IDX_user_notifications_user_is_read', ['userId', 'isRead'])
export class UserNotifications {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({
    type: 'text',
    array: true,
  })
  contents: string[];

  @Column({
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  readAt?: Date;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @Column({
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => Notifications, (notif) => notif.userNotifications, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  notification: Notifications;
}
