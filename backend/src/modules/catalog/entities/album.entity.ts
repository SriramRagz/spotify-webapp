import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Track } from './track.entity.js';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'cover_url', type: 'text', nullable: true })
  coverUrl!: string | null;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate!: string | null;

  @Column({ name: 'album_type', length: 30, default: 'album' })
  albumType!: string;

  @OneToMany(() => Track, (track) => track.album)
  tracks!: Relation<Track[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
