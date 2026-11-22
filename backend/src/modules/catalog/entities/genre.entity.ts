import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Track } from './track.entity.js';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => Track, (track) => track.genres)
  tracks!: Relation<Track[]>;
}
