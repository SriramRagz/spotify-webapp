import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Track } from './track.entity.js';

@Entity('track_audio_files')
export class TrackAudioFile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'storage_key', type: 'text' })
  storageKey!: string;

  @Column({ length: 20 })
  format!: string;

  @Column({ type: 'integer', nullable: true })
  bitrate!: number | null;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs!: number | null;

  @Column({ length: 30, default: 'pending' })
  status!: string;

  @ManyToOne(() => Track, (track) => track.audioFiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'track_id' })
  track!: Relation<Track>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
