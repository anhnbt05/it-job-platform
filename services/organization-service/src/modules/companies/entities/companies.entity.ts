import { Branches } from '@/modules/branches/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Companies {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column()
  name!: string;

  @Column({
    nullable: true,
  })
  logo_url?: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  website?: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  size?: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Branches, (b) => b.company, {
    cascade: true,
  })
  branches: Branches[];
}
