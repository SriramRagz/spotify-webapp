import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { User } from './user.entity.js';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    name: 'display_name',
    length: 100,
    nullable: true,
  })
  displayName: string | null;

  @Column({
    type: 'varchar',
    name: 'avatar_url',
    nullable: true,
  })
  avatarUrl: string | null;

  @Column({ type: 'varchar', default: 'en' })
  language: string;

  @Column({ type: 'boolean', name: 'explicit_content_enabled', default: true })
  explicitContentEnabled: boolean;

  @Column({ type: 'varchar', default: 'dark', length: 20 })
  theme: string;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
