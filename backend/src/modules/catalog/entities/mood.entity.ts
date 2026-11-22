import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Track } from './track.entity.js';

@Entity('moods')
export class Mood {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToMany(() => Track, (track) => track.moods)
  tracks!: Relation<Track[]>;
}
